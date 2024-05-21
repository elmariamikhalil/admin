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

const EditUser = () => {
  const { id } = useParams()
  const [user, setUser] = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/user/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user details')
        }
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response received')
        }
        const data = JSON.parse(text)
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Failed to fetch user details. Please try again.')
      }
    }

    fetchUser()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${ENDPOINT}/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      navigate('/users')
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user. Please try again.')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Edit User</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit}>
          <div>
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={user.email || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              name="name"
              value={user.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Picture</CFormLabel>
            <CFormInput
              type="text"
              name="picture"
              value={user.picture || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <CFormLabel>Position</CFormLabel>
            <CFormInput
              type="text"
              name="position"
              value={user.position || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <CFormLabel>Role</CFormLabel>
            <CFormInput
              type="text"
              name="role"
              value={user.role || ''}
              onChange={handleInputChange}
            />
          </div>
          <CButton type="submit" color="primary">
            Save Changes
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditUser
