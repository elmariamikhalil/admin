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
  const [user, setUser] = useState({
    email: '',
    name: '',
    position: '',
    role: '',
    picture: '',
  })
  const [error, setError] = useState('')
  const [picture, setPicture] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/user/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user details')
        }
        const data = await response.json()
        setUser({
          email: data.email || '',
          name: data.Name || '',
          position: data.Position || '',
          role: data.Role || '',
          picture: data.Picture || '',
        })
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setPicture(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('name', user.name)
      formData.append('position', user.position)
      formData.append('role', user.role)
      if (picture) {
        formData.append('picture', picture)
      }

      const response = await fetch(`${ENDPOINT}/api/user/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      navigate('/base/accordion/users')
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
              value={user.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Picture</CFormLabel>
            <CFormInput type="file" name="picture" onChange={handleFileChange} />
            {user.picture && (
              <img
                src={`${ENDPOINT}/uploads/${user.picture}`}
                alt="User"
                style={{ width: '100px', height: '100px' }}
              />
            )}
          </div>
          <div>
            <CFormLabel>Position</CFormLabel>
            <CFormInput
              type="text"
              name="position"
              value={user.position}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <CFormLabel>Role</CFormLabel>
            <CFormInput type="text" name="role" value={user.role} onChange={handleInputChange} />
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
