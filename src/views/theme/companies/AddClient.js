import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormLabel,
} from '@coreui/react'

const AddClient = () => {
  const [Name, setName] = useState('')
  const [Owner, setOwner] = useState('')
  const [Email, setEmail] = useState('')
  const [Category, setCategory] = useState('')
  const [Logo, setLogo] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')

  useEffect(() => {
    // Fetch projects data when the component mounts
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleOwnerChange = (e) => {
    setOwner(e.target.value)
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0])
  }

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('Name', Name)
    formData.append('Owner', Owner)
    formData.append('Contact', Email)
    formData.append('Category', Category)
    formData.append('logo', Logo)
    formData.append('ProjectID', selectedProject)

    try {
      const response = await fetch('http://localhost:5000/addclient', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        // Company added successfully
        alert('Company added successfully')
      } else {
        // Handle error
        alert('Failed to add company')
      }
    } catch (error) {
      console.error('Error adding company:', error)
      alert('An error occurred while adding company')
    }
  }

  return (
    <CContainer>
      <>
        <CCard className="mb-4">
          <CCardHeader>Add Company</CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Name:</CFormLabel>
                <CFormInput
                  type="text"
                  value={Name}
                  onChange={handleNameChange}
                  required
                  id="name"
                  autoComplete="additional-name"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Owner:</CFormLabel>
                <CFormInput
                  type="text"
                  value={Owner}
                  onChange={handleOwnerChange}
                  required
                  id="owner"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Email:</CFormLabel>
                <CFormInput
                  type="email"
                  value={Email}
                  onChange={handleEmailChange}
                  required
                  id="email"
                  autoComplete="email"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Category:</CFormLabel>
                <CFormSelect
                  value={Category}
                  onChange={handleCategoryChange}
                  required
                  id="category"
                >
                  <option value="">Select Category</option>
                  <option value="Key Client">Key Client</option>
                  <option value="Client">Client</option>
                  <option value="Intern">Intern</option>
                  <option value="CFO">CFO</option>
                  <option value="Exit Client">Exit Client</option>
                  <option value="On Hold">On Hold</option>
                  <option value="SOW">SOW</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Project:</CFormLabel>
                <CFormSelect
                  value={selectedProject}
                  onChange={handleProjectChange}
                  required
                  id="project"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.ID} value={project.ID}>
                      {project.Name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Logo:</CFormLabel>
                <CFormInput
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  required
                  id="logo"
                />
              </CCol>
              <CButton color="primary" type="submit">
                Add Company
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </>
    </CContainer>
  )
}

export default AddClient
