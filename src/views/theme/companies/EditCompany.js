import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormLabel,
  CCol,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000' // Adjusted the endpoint to match the server.js configuration

const EditCompany = () => {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [Picture, setLogo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/clients/${id}`)
        const data = await response.json()
        setName(data.Name)
        setOwner(data.Owner)
        setEmail(data.Contact)
        setCategory(data.Category)
      } catch (error) {
        console.error('Error fetching company details:', error)
      }
    }

    fetchCompanyDetails()
  }, [id])

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('Name', name)
    formData.append('Owner', owner)
    formData.append('Contact', email)
    formData.append('Category', category)
    formData.append('logo', Picture)

    try {
      const response = await fetch(`${ENDPOINT}/editclient/${id}`, {
        method: 'PUT',
        body: formData,
      })
      if (response.ok) {
        // Company updated successfully
        alert('Company updated successfully')
        navigate('/theme/companies/Companies') // Navigate to a desired route after update
      } else {
        // Handle error
        alert('Failed to update company')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('An error occurred while updating company')
    }
  }

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardHeader>Edit Company</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit} className="row g-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">Name:</CFormLabel>
              <CFormInput
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                id="name"
                autoComplete="off"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="owner">Owner:</CFormLabel>
              <CFormInput
                type="text"
                value={owner}
                onChange={handleOwnerChange}
                required
                id="owner"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="email">Email:</CFormLabel>
              <CFormInput
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                id="email"
                autoComplete="email"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="category">Category:</CFormLabel>
              <CFormSelect value={category} onChange={handleCategoryChange} required id="category">
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
              <CFormLabel htmlFor="Picture">Logo:</CFormLabel>
              <CFormInput type="file" accept="image/*" onChange={handleLogoChange} id="Picture" />
            </CCol>
            <CButton color="primary" type="submit">
              Update Company
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default EditCompany
