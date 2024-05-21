import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CAlert,
} from '@coreui/react'
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Send a request to the server to authenticate the user
      const response = await fetch(`http://localhost:5000/user/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // Check if the request was successful
      if (response.ok) {
        // If successful, parse the response and extract the authentication token
        const data = await response.json()
        const authToken = data.token
        // Store the authentication token in local storage or session storage
        localStorage.setItem('authToken', authToken)

        // Redirect the user to the dashboard or any other protected route

        // Redirect the user based on their role
        const userRole = data.role
        if (userRole === 'Admin') {
          navigate('/')
        } else {
          navigate('/user')
        }

        // Show success message
        setSuccess(true)
        // Clear error message
        setError('')
      } else {
        // If authentication fails, display an error message
        setError('Invalid email or password')
        // Clear success message
        setSuccess(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while logging in')
      setSuccess(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCard className="p-4">
              <CCardHeader>Login</CCardHeader>
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {/* Error message */}
                  {error && <CAlert color="danger">Failed to login</CAlert>}
                  {/* Success message */}
                  {success && <CAlert color="success">Login successful!</CAlert>}
                  <CButton type="submit" color="primary">
                    Login
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
