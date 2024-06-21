import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAvatar,
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
  advisory: ['Project', 'Hours', 'Deadlines'],
  yearwork: ['IB', 'FS', 'VPB', 'SUP', 'KVK', 'YW'],
}

const enumValues = ['NA', 'O', 'DN', 'W', 'P', 'R', 'D', 'A', 'C']

const currentYear = new Date().getFullYear()
const years = Array.from(new Array(4), (_, index) => currentYear - index)
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
  const [selectedColumn, setSelectedColumn] = useState('')
  const [startYear, setStartYear] = useState(currentYear)
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1)
  const [endYear, setEndYear] = useState(currentYear)
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1)
  const [dataExists, setDataExists] = useState(true)
  const [vatPeriod, setVatPeriod] = useState('')
  const [icpPeriod, setIcpPeriod] = useState('')

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
    const fetchPieChartData = async () => {
      try {
        const response = await fetch(
          `${ENDPOINT}/api/pie/${activeTab}/${clientId}?startYear=${startYear}&startMonth=${startMonth}&endYear=${endYear}&endMonth=${endMonth}&column=${selectedColumn}`,
        )
        const data = await response.json()

        if (response.ok) {
          const filteredData = Object.entries(data).filter(([_, count]) => count > 0)
          const labels = filteredData.map(([option]) => option)
          const series = filteredData.map(([_, count]) => count)

          setDoughnutData({
            labels,
            series,
            colors: getColors(labels), // Ensure colors are populated correctly
          })
        } else {
          console.error('Error fetching pie chart data:', data.error)
        }
      } catch (error) {
        console.error('Error fetching pie chart data:', error)
      }
    }

    fetchPieChartData()
  }, [clientId, activeTab, startYear, startMonth, endYear, endMonth, selectedColumn])
  const getColors = (labels) => {
    const colorMap = {
      NA: '#1E90FF', // Dodger Blue
      O: '#FF6347', // Tomato
      DN: '#32CD32', // Lime Green
      W: '#FFD700', // Gold
      P: '#8A2BE2', // Blue Violet
      R: '#FFA500', // Orange
      D: '#FF1493', // Deep Pink
      A: '#00CED1', // Dark Turquoise
      C: '#20B2AA', // Light Sea Green
    }

    return labels.map((label) => colorMap[label])
  }

  const fetchTabData = async (tab) => {
    try {
      const response = await fetch(
        `${ENDPOINT}/api/${tab}/${clientId}?year=${selectedYear}&month=${selectedMonth}`,
      )
      const data = await response.json()
      if (response.ok) {
        console.log(`Fetched data for ${tab}:`, data) // Debug log
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
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/administration/period/${clientId}`)
        const data = await response.json()
        if (response.ok) {
          setVatPeriod(data.PeriodVAT)
          setIcpPeriod(data.PeriodICP)
        } else {
          console.error('Error fetching periods:', data.error)
        }
      } catch (error) {
        console.error('Error fetching periods:', error)
      }
    }

    fetchPeriods()
  }, [clientId])

  const extractInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }
  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value)
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

  /*const chartOptions = {
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: doughnutData ? doughnutData.labels : [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }
  const chartSeries = doughnutData ? doughnutData.series : []*/

  return (
    <>
      {client && (
        <CRow>
          <CCol sm={8}>
            <CCard className="mb-4">
              <CCardHeader>
                <h4>{client.Name}</h4>
              </CCardHeader>
              <CCardBody>
                <CRow className="align-items-center">
                  <CCol md="4">
                    <CImage
                      src={`${ENDPOINT}/uploads/${client.logo}`}
                      alt="Client Logo"
                      rounded
                      thumbnail
                      width="200"
                      height="200"
                    />
                  </CCol>
                  <CCol md="8">
                    <div className="d-flex flex-column align-items-start">
                      <div>
                        <h2>{client.Name}</h2>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <CAvatar color="primary" textColor="white">
                          {extractInitials(client.Owner)}
                        </CAvatar>
                        <span className="ml-2">{client.Owner}</span>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={4}>
            <CCard className="mb-4">
              <CCardHeader>Team Members</CCardHeader>
              <CCardBody>
                <div className="team-list">
                  {teamMembers.map((team, index) => (
                    <div key={index} className="team mb-3">
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
          <CCard className="mb-4" style={{ height: '100%' }}>
            <CCardHeader>Pie Chart</CCardHeader>
            <CCardBody>
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
                <CFormSelect value={selectedColumn} onChange={handleColumnChange} className="mb-3">
                  <option value="">All Columns</option>
                  {tabOptions[activeTab].map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              {doughnutData && (
                <ReactApexChart
                  options={{
                    chart: {
                      type: 'donut',
                    },
                    labels: doughnutData.labels,
                    colors: doughnutData.colors, // Include the colors array here
                  }}
                  series={doughnutData.series}
                  type="donut"
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
                          value={tabData[option] || 'NA'}
                          onChange={(event) => handleSelectChange(event, option)}
                          style={{ width: '100%' }}
                        >
                          {enumValues.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </CFormSelect>
                        {option === 'VAT' && tabData.Period && tabData.Period.includes('VAT') && (
                          <small>{tabData.Period}</small>
                        )}
                        {option === 'ICP' && tabData.Period && tabData.Period.includes('ICP') && (
                          <small>{tabData.Period}</small>
                        )}
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
