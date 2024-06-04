import React, { useState, useEffect } from 'react'
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
      const response = await fetch(`${ENDPOINT}/projects/${projectId}`)
      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchTeam = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/projects/${projectId}/team`)
      const data = await response.json()
      setTeam(data)
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const fetchClients = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/projects/${projectId}/clients`)
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchHoursDetails = async (projectId) => {
    try {
      const response = await fetch(`${ENDPOINT}/projects/${projectId}/hours`)
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
                <CImage src={`${ENDPOINT}/uploads/${project.Logo}`} alt="Project Logo" fluid />
              )}
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>Team</CCardHeader>
            <CCardBody>
              {team.map((member) => (
                <div key={member.ID}>
                  <p>{member.name}</p>
                </div>
              ))}
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
                      <CTableDataCell>{client.Category}</CTableDataCell>
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
