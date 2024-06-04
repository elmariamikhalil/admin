import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CButton,
  CFormSelect,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilPencil } from '@coreui/icons'

const ENDPOINT = 'http://localhost:5000' // Your server URL

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate() // Corrected import and usage

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/projects`)
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    fetchProjects()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleViewClick = (projectId) => {
    // Navigate to the project details page
    navigate(`/base/projects/ProjectDetailPage/${projectId}`)
  }

  const handleEditClick = (projectId) => {
    // Navigate to the edit project details page
    navigate(`/base/projects/EditProject/${projectId}`)
  }

  const filteredProjects = projects.filter((project) => {
    return searchTerm ? project.Name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  })

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Projects</h5>
        <div className="d-flex align-items-center">
          <CFormInput
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            style={{ width: '200px' }}
          />
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Logo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredProjects.map((project) => (
              <CTableRow key={project.ID}>
                <CTableDataCell>{project.Name}</CTableDataCell>
                <CTableDataCell>
                  {project.Logo && (
                    <img
                      src={`${ENDPOINT}/uploads/${project.Logo}`}
                      alt="Project Logo"
                      style={{ width: 'auto', height: '40px' }}
                    />
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    alt="see more"
                    onClick={() => handleViewClick(project.ID)}
                    className="me-2"
                  >
                    <CIcon icon={cilFullscreen} />
                  </CButton>
                  <CButton color="secondary" alt="edit" onClick={() => handleEditClick(project.ID)}>
                    <CIcon icon={cilPencil} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default Projects
