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

const CompanyDetailPage = () => {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [activeTab, setActiveTab] = useState('administration')
  const [tabData, setTabData] = useState({})
  const [doughnutData, setDoughnutData] = useState(null)

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
  }, [client, activeTab])

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

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/teams/${teamId}`)
      const data = await response.json()
      if (response.ok) {
        // Extract the team members from the response
        const { members } = data
        // Now you have the team members, update the state
        setTeamMembers(members)
      } else {
        console.error('Error fetching team details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching team details:', error)
    }
  }

  const fetchTabData = async (tab) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/${tab}/${clientId}`)
      const data = await response.json()
      console.log(`Data for ${tab}:`, data) // Log to console
      setTabData(data)
    } catch (error) {
      console.error(`Error fetching data for ${tab}:`, error)
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
        body: JSON.stringify(tabData),
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
                {teamMembers.map((member, index) => (
                  <div key={index} className="mb-2">
                    <CAvatar src={`${ENDPOINT}/uploads/${member.Picture}`} className="me-2" />
                    <div>
                      <strong>{member.Name}</strong>
                      <p>{member.Position}</p>
                    </div>
                  </div>
                ))}
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
              <CTable>
                <CTableBody style={{ display: 'inline-flex' }}>
                  {tabOptions[activeTab].map((option) => (
                    <CTableRow key={option} style={{ width: '50%' }}>
                      <CTableDataCell>
                        <label style={{ marginRight: '10px' }}>{option}</label>
                        <CFormSelect
                          value={tabData[option]}
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
