import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CAlert,
} from '@coreui/react'

const AddUsers = () => {
  // State variables to store form data and error message
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // Send formData to the server to add the user to the database
    // You can use fetch or axios to make a POST request to your backend API
    // Example:
    fetch('http://localhost:5000/api/add/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add user')
        }
        return response.json()
      })
      .then((data) => {
        console.log('User added successfully:', data)
        // Reset form fields after successful submission
        setFormData({
          email: '',
          password: '',
          name: '',
        })
        // Clear any previous error messages
        setError('')
      })
      .catch((error) => {
        console.error('Error adding user:', error.message)
        // Display error message to the user
        setError('Failed to add user. Please try again.')
      })
    console.log('Form submitted:', formData)
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Add User</CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {error && <CAlert color="danger">{error}</CAlert>}
              <div>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <CFormLabel>Password</CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <CButton type="submit" color="primary">
                Add User
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddUsers
