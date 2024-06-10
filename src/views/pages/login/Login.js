import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
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
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/user/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const authToken = data.token
        localStorage.setItem('authToken', authToken)

        // Dispatch an action to update the Redux store
        dispatch({ type: 'LOGIN_SUCCESS', payload: data })

        const userRole = data.Role
        if (userRole === 'Admin') {
          navigate('/')
        } else {
          alert('You do not have access to this application.')
          navigate('/login')
        }

        setSuccess(true)
        setError('')
      } else {
        setError('Invalid email or password')
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
                  {error && <CAlert color="danger">{error}</CAlert>}
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
