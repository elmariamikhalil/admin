import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000'

const EditProject = () => {
  const { id } = useParams()
  const [project, setProject] = useState({})
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [logo, setLogo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/projects/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch project details')
        }
        const data = await response.json()
        setProject(data)
        setName(data.Name)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to fetch project details. Please try again.')
      }
    }

    fetchProject()
  }, [id])

  const handleInputChange = (e) => {
    setName(e.target.value)
  }

  const handleFileChange = (e) => {
    setLogo(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('Name', name)
      if (logo) {
        formData.append('logo', logo)
      }

      const response = await fetch(`${ENDPOINT}/projects/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      navigate('/base/projects/Projects')
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project. Please try again.')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Edit Project</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit}>
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput type="text" value={name} onChange={handleInputChange} required />
          </div>
          <div>
            <CFormLabel>Logo</CFormLabel>
            <CFormInput type="file" onChange={handleFileChange} />
            {project.Logo && (
              <img
                src={`${ENDPOINT}/uploads/${project.Logo}`}
                alt="Project Logo"
                style={{ width: 'auto', height: '60px' }}
              />
            )}
          </div>
          <CButton type="submit" color="primary">
            Save Changes
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditProject
