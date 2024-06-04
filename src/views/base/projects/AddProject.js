import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const AddProject = () => {
  const [Name, setName] = useState('')
  const [logo, setLogo] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('Name', Name)
      formData.append('logo', logo)

      const response = await fetch(`${ENDPOINT}/projects`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to add project')
      }

      navigate('/projects')
    } catch (error) {
      console.error('Error adding project:', error)
      setError('Failed to add project. Please try again.')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Add Project</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit}>
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput type="text" value={Name} onChange={handleNameChange} required />
          </div>
          <div>
            <CFormLabel>Logo</CFormLabel>
            <CFormInput type="file" onChange={handleLogoChange} required />
          </div>
          <CButton type="submit" color="primary">
            Add Project
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AddProject
