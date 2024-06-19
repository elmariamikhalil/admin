import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CImage,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CProgress,
  CFormInput,
  CFormSelect,
  CButton,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilFullscreen, cilPencil } from '@coreui/icons'

const ENDPOINT = 'http://localhost:5000' // Your server URL

const ProjectDetailPage = () => {
  const { id } = useParams()
  const [project, setProject] = useState({})
  const [team, setTeam] = useState([])
  const [clients, setClients] = useState([])
  const [hoursSigned, setHoursSigned] = useState(0)
  const [fulfilledHours, setFulfilledHours] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [optionCounts, setOptionCounts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchProject(id)
    fetchTeam(id)
    fetchClients(id)
    fetchHoursDetails(id)
  }, [id])

  useEffect(() => {
    calculateOptionCounts()
  }, [clients])

  const fetchProject = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/projects/${projectId}`)
      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchTeam = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/projects/${projectId}/team`)
      const data = await response.json()
      setTeam(data)
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const fetchClients = async (projectId) => {
    try {
      const response = await axios.get(`${ENDPOINT}/api/projects/${projectId}/clients`)
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchHoursDetails = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/api/projects/${projectId}/hours`)
      const data = await response.json()
      setHoursSigned(data.hoursSigned)
      setFulfilledHours(data.fulfilledHours)
    } catch (error) {
      console.error('Error fetching hours details:', error)
    }
  }

  const calculateOptionCounts = () => {
    const counts = {}

    clients.forEach((client) => {
      if (client.Tabs) {
        client.Tabs.forEach((tab) => {
          if (tab.Options) {
            tab.Options.forEach((option) => {
              if (counts[option]) {
                counts[option] += 1
              } else {
                counts[option] = 1
              }
            })
          }
        })
      }
    })

    setOptionCounts(counts)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
  }

  const handleViewClick = (clientId) => {
    navigate(`/theme/companies/CompanyDetailPage/${clientId}`)
  }

  const handleEditClick = (clientId) => {
    navigate(`/theme/companies/EditCompany/${clientId}`)
  }

  const filteredClients = clients.filter((client) =>
    client.Name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClientsByCategory = selectedCategory
    ? filteredClients.filter((client) => client.Category === selectedCategory)
    : filteredClients

  return (
    <div>
      <CRow>
        <CCol sm="6">
          <CCard>
            <CCardHeader>Project Overview</CCardHeader>
            <CCardBody>
              <h5>{project.Name}</h5>
              {project.Logo && (
                <CImage
                  src={`${ENDPOINT}/uploads/${project.Logo}`}
                  width={150}
                  alt="Project Logo"
                  fluid
                />
              )}
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>Team</CCardHeader>
            <CCardBody>
              <div className="avatars-stack">
                {team.map((member) => (
                  <div
                    key={member.ID}
                    className="avatar"
                    content={`${member.Name} - ${member.Position}`}
                  >
                    <CImage
                      src={`${ENDPOINT}/uploads/${member.Picture}`}
                      className="avatar-img"
                      alt={member.email}
                      width={50}
                      height={50}
                    />
                  </div>
                ))}
                {team.length > 3 && <div className="avatar bg-secondary">+{team.length - 3}</div>}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6">
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <span>Clients</span>
                <div>
                  <CFormInput
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div>
                  <CFormSelect onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="">Filter by Category</option>
                    <option value="Key Client">Key Client</option>
                    <option value="Client">Client</option>
                    <option value="Exit Client">Exit Client</option>
                    <option value="On Hold">On Hold</option>
                  </CFormSelect>
                </div>
              </div>
            </CCardHeader>
            <CCardBody style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Category</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredClientsByCategory.map((client) => (
                    <CTableRow key={client.ID}>
                      <CTableDataCell>{client.Name}</CTableDataCell>
                      <CTableDataCell>
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
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          alt="see more"
                          onClick={() => handleViewClick(client.ID)}
                          className="me-2"
                        >
                          <CIcon icon={cilFullscreen} />
                        </CButton>
                        <CButton
                          color="secondary"
                          alt="edit"
                          onClick={() => handleEditClick(client.ID)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader>Hours Overview</CCardHeader>
            <CCardBody>
              <p>Hours Signed: {hoursSigned}</p>
              <p>Fulfilled Hours: {fulfilledHours}</p>
              <CProgress animated value={fulfilledHours} max={hoursSigned} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        {Object.keys(optionCounts).map((tabName) => (
          <CCol sm="6" lg="4" key={tabName}>
            <CCard>
              <CCardHeader>Tab: {tabName}</CCardHeader>
              <CCardBody>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Option</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Count</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Object.keys(optionCounts[tabName]).map((option) => (
                      <CTableRow key={option}>
                        <CTableDataCell>{option}</CTableDataCell>
                        <CTableDataCell>{optionCounts[tabName][option]}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow>
        {Object.keys(optionCounts).map((option) => (
          <CCol sm="6" lg="4" key={option}>
            <CWidgetStatsF
              color="info"
              icon={<CIcon width={24} icon={cilPeople} />}
              title={option}
              value={optionCounts[option]}
            />
          </CCol>
        ))}
      </CRow>
    </div>
  )
}

export default ProjectDetailPage
