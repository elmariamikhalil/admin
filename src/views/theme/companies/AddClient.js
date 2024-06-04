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
        alert('Client added successfully')
      } else {
        alert('Failed to add client')
      }
    } catch (error) {
      console.error('Error adding client:', error)
      alert('An error occurred while adding client')
    }
  }

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardHeader>Add Client</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit} className="row g-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">Name:</CFormLabel>
              <CFormInput type="text" id="name" value={Name} onChange={handleNameChange} required />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="owner">Owner:</CFormLabel>
              <CFormInput
                type="text"
                id="owner"
                value={Owner}
                onChange={handleOwnerChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="email">Email:</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                value={Email}
                onChange={handleEmailChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="category">Category:</CFormLabel>
              <CFormSelect id="category" value={Category} onChange={handleCategoryChange} required>
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
              <CFormLabel htmlFor="project">Project:</CFormLabel>
              <CFormSelect
                id="project"
                value={selectedProject}
                onChange={handleProjectChange}
                required
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
              <CFormLabel htmlFor="logo">Logo:</CFormLabel>
              <CFormInput
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                required
              />
            </CCol>
            <CCol xs={12}>
              <CButton color="primary" type="submit">
                Add Client
              </CButton>
            </CCol>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AddClient
