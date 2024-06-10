import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
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
} from '@coreui/react'
import { Avatar } from 'tabler-react' // Import Avatar component from Tabler UI

const ENDPOINT = 'http://localhost:5000' // Your server URL

const ProjectDetailPage = () => {
  const { id } = useParams()
  const [project, setProject] = useState({})
  const [team, setTeam] = useState([])
  const [clients, setClients] = useState([])
  const [hoursSigned, setHoursSigned] = useState(0)
  const [fulfilledHours, setFulfilledHours] = useState(0)

  useEffect(() => {
    fetchProject(id)
    fetchTeam(id)
    fetchClients(id)
    fetchHoursDetails(id)
  }, [id])

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
      console.log('Team Data:', data) // Add this line
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
              <div class="avatars-stack">
                {team.map((member) => (
                  <div
                    key={member.ID}
                    class="avatar"
                    content={`${member.Name} - ${member.Position}`}
                  >
                    <CImage
                      src={`${ENDPOINT}/uploads/${member.Picture}`}
                      class="avatar-img"
                      alt={member.email}
                      width={50}
                      height={50}
                    />
                  </div>
                ))}
                {/* Add the condition to show the remaining count */}
                {team.length > 3 && <div class="avatar bg-secondary">+{team.length - 3}</div>}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6">
          <CCard>
            <CCardHeader>Clients</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Contact</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Category</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {clients.map((client) => (
                    <CTableRow key={client.ID}>
                      <CTableHeaderCell>{client.ID}</CTableHeaderCell>
                      <CTableDataCell>{client.Name}</CTableDataCell>
                      <CTableDataCell>{client.Contact}</CTableDataCell>
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
    </div>
  )
}

export default ProjectDetailPage
