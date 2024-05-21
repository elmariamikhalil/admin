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

const EditCompany = () => {
  const { id } = useParams()
  const [company, setCompany] = useState({
    Name: '',
    Owner: '',
    Email: '',
    Category: '',
    Picture: '',
  })
  const [newPicture, setNewPicture] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/client/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch company details')
        }
        const data = await response.json()
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company:', error)
        setError('Failed to fetch company details. Please try again.')
      }
    }

    fetchCompany()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCompany({ ...company, [name]: value })
  }

  const handleFileChange = (e) => {
    setNewPicture(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('Name', company.Name)
    formData.append('Owner', company.Owner)
    formData.append('Email', company.Email)
    formData.append('Category', company.Category)
    if (newPicture) {
      formData.append('Picture', newPicture)
    }

    try {
      const response = await fetch(`${ENDPOINT}/client/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update company')
      }

      navigate('/theme/companies')
    } catch (error) {
      console.error('Error updating company:', error)
      setError('Failed to update company. Please try again.')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Edit Company</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              name="Name"
              value={company.Name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Owner</CFormLabel>
            <CFormInput
              type="text"
              name="Owner"
              value={company.Owner}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              name="Email"
              value={company.Email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Category</CFormLabel>
            <CFormInput
              type="text"
              name="Category"
              value={company.Category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Current Picture</CFormLabel>
            {company.Picture && (
              <div>
                <img
                  src={`data:image/jpeg;base64,${company.Picture}`}
                  alt="Company"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    marginBottom: '10px',
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <CFormLabel>Change Picture</CFormLabel>
            <CFormInput type="file" name="Picture" onChange={handleFileChange} />
          </div>
          <CButton type="submit" color="primary">
            Save Changes
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditCompany
