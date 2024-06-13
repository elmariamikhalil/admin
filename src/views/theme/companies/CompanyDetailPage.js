import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CChart } from '@coreui/react-chartjs'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAvatar,
  CBadge,
  CImage,
  CTableBody,
  CTableRow,
  CNav,
  CNavItem,
  CNavLink,
  CTableDataCell,
  CTable,
  CFormSelect,
  CButton,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000' // Your server URL

const tabOptions = {
  administration: ['Cash', 'Bank', 'Invoice', 'LIP', 'TB', 'VAT', 'ICP', 'Salary', 'CBS'],
  backoffice: ['Pay', 'Billing', 'Report', 'Mail'],
  audit: ['FS', 'Hours', 'Deadlines'],
  advisory: ['ProjectHours', 'Deadlines'],
  yearwork: ['IB', 'FS', 'VPB', 'SUP', 'KVK'],
}

const enumValues = ['N/A', 'O', 'DN', 'W', 'P', 'R', 'D', 'A', 'C']

const currentYear = new Date().getFullYear()
const years = Array.from(new Array(4), (val, index) => currentYear - index)
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const CompanyDetailPage = () => {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [activeTab, setActiveTab] = useState('administration')
  const [tabData, setTabData] = useState({})
  const [doughnutData, setDoughnutData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [startYear, setStartYear] = useState(currentYear)
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1)
  const [endYear, setEndYear] = useState(currentYear)
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1)
  const [dataExists, setDataExists] = useState(true)

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/clients/${clientId}`)
        const data = await response.json()
        setClient(data)
        if (data.TeamID) {
          fetchTeamMembers(data.TeamID)
        }
      } catch (error) {
        console.error('Error fetching company details:', error)
      }
    }

    fetchCompanyDetails()
  }, [clientId])

  useEffect(() => {
    if (client) {
      fetchTabData(activeTab)
    }
  }, [client, activeTab, selectedYear, selectedMonth])

  useEffect(() => {
    const fetchDoughnutData = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/doughnut/${clientId}`)
        const data = await response.json()
        setDoughnutData(data)
      } catch (error) {
        console.error('Error fetching doughnut data:', error)
      }
    }

    fetchDoughnutData()
  }, [clientId])

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/teams/${teamId}`)
      const data = await response.json()
      if (response.ok) {
        const { members } = data
        setTeamMembers(members)
      } else {
        console.error('Error fetching team members:', data.error)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }
  useEffect(() => {
    fetchPieChartData()
  }, [clientId, activeTab, startYear, startMonth, endYear, endMonth])

  const fetchPieChartData = async () => {
    try {
      const response = await fetch(
        `${ENDPOINT}/api/pie/${activeTab}/${clientId}?startYear=${startYear}&startMonth=${startMonth}&endYear=${endYear}&endMonth=${endMonth}`,
      )
      const data = await response.json()

      if (response.ok) {
        const labels = Object.keys(data)
        const counts = Object.values(data)
        const total = counts.reduce((acc, count) => acc + count, 0)
        const percentages = counts.map((count) => (count / total) * 100)

        setDoughnutData({
          labels,
          datasets: [
            {
              data: percentages,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
              ],
            },
          ],
        })
      } else {
        console.error('Error fetching pie chart data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching pie chart data:', error)
    }
  }
  const fetchTabData = async (tab) => {
    try {
      const response = await fetch(
        `${ENDPOINT}/api/${tab}/${clientId}?year=${selectedYear}&month=${selectedMonth}`,
      )
      const data = await response.json()
      if (response.ok) {
        setTabData(data)
        setDataExists(true)
      } else {
        console.error(`Error fetching data for ${tab}:`, data.error)
        setTabData({})
        setDataExists(false)
      }
    } catch (error) {
      console.error(`Error fetching data for ${tab}:`, error)
      setTabData({})
      setDataExists(false)
    }
  }

  const extractInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSelectChange = (event, field) => {
    setTabData((prevData) => ({
      ...prevData,
      [field]: event.target.value,
    }))
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${ENDPOINT}/api/${activeTab}/${clientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tabData,
          ClientID: clientId,
          Year: selectedYear,
          Month: selectedMonth,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        alert('Data saved successfully')
      } else {
        console.error('Error saving data:', result.error)
        alert('Error saving data')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Error saving data')
    }
  }

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value)
    handleSelectChange(event, 'Year') // Update tabData with the selected year
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
    handleSelectChange(event, 'Month') // Update tabData with the selected month
  }
  const handleStartYearChange = (event) => {
    setStartYear(event.target.value)
  }

  const handleStartMonthChange = (event) => {
    setStartMonth(event.target.value)
  }

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value)
  }

  const handleEndMonthChange = (event) => {
    setEndMonth(event.target.value)
  }
  return (
    <>
      {client && (
        <CRow>
          <CCol sm={8}>
            <CCard>
              <CCardHeader>Company Details</CCardHeader>
              <CCardBody>
                <CRow className="align-items-center">
                  <CCol md="6">
                    <CImage
                      src={`${ENDPOINT}/uploads/${client.logo}`}
                      alt="Client Logo"
                      rounded
                      thumbnail
                      width="200"
                      height="200"
                    />
                  </CCol>
                  <CCol md="6">
                    <CAvatar color="primary" textColor="white">
                      {extractInitials(client.Owner)}
                    </CAvatar>
                    {client.Owner}
                  </CCol>
                  <CCol xs={4}>
                    <CBadge
                      color={
                        client.Category === 'Key Client'
                          ? 'success'
                          : client.Category === 'Client'
                            ? 'info'
                            : client.Category === 'Exit Client'
                              ? 'danger'
                              : client.Category === 'On Hold'
                                ? 'warning'
                                : 'primary'
                      }
                      shape="rounded-pill"
                    >
                      {client.Category}
                    </CBadge>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={4}>
            <CCard>
              <CCardHeader>Team Members</CCardHeader>
              <CCardBody>
                <div className="team-list">
                  {teamMembers.map((team, index) => (
                    <div key={index} className="team">
                      <div className="team-name">{team.Name}</div>
                      <div className="avatar-stack">
                        {team.members.map((member, memberIndex) => (
                          <div
                            key={memberIndex}
                            className="avatar"
                            style={{ zIndex: team.members.length - memberIndex }}
                          >
                            <img src={`${ENDPOINT}/uploads/${member.Picture}`} alt={member.Name} />
                            <div className="avatar-hover">
                              <strong>{member.Name}</strong>
                              <p>{member.Position}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
      <CRow className="mb-4">
        <CCol xs={12} sm={4}>
          <CCard>
            <CCardHeader>Pie Chart</CCardHeader>
            <CCardBody style={{ height: '100%' }}>
              <div className="d-flex align-items-center mb-3">
                <CFormSelect value={startYear} onChange={handleStartYearChange}>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </CFormSelect>
                <CFormSelect value={startMonth} onChange={handleStartMonthChange}>
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </CFormSelect>
                <span className="mx-2">to</span>
                <CFormSelect value={endYear} onChange={handleEndYearChange}>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </CFormSelect>
                <CFormSelect value={endMonth} onChange={handleEndMonthChange}>
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              {doughnutData && (
                <CChart
                  type="doughnut"
                  datasets={doughnutData.datasets}
                  labels={doughnutData.labels}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={8}>
          <CCard style={{ height: '400px' }}>
            <CCardHeader>
              <CNav variant="tabs">
                {Object.keys(tabOptions).map((tab) => (
                  <CNavItem key={tab}>
                    <CNavLink active={activeTab === tab} onClick={() => handleTabChange(tab)}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </CNavLink>
                  </CNavItem>
                ))}
              </CNav>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex align-items-center">
                <CFormSelect
                  value={selectedYear}
                  onChange={handleYearChange}
                  className={!dataExists ? 'border-danger' : ''}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </CFormSelect>
                <CFormSelect
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className={!dataExists ? 'border-danger' : ''}
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <CTable>
                <CTableBody style={{ display: 'inline-flex' }}>
                  {tabOptions[activeTab].map((option) => (
                    <CTableRow key={option} style={{ width: '50%' }}>
                      <CTableDataCell>
                        <label style={{ marginRight: '10px' }}>{option}</label>
                        <CFormSelect
                          value={tabData[option] || 'N/A'}
                          onChange={(event) => handleSelectChange(event, option)}
                          style={{ width: '100%' }}
                        >
                          {enumValues.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <CButton color="primary" className="mt-3" onClick={handleSaveChanges}>
                Save Changes
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CompanyDetailPage
