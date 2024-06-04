import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import { cilUserPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const ENDPOINT = 'http://localhost:5000'

const AddUser = () => {
  const [teams, setTeams] = useState([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    team: '',
    role: '',
    position: '',
    picture: null,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/marabesteam`)
        const data = await response.json()
        setTeams(data)
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }

    fetchTeams()
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const form = new FormData()
    for (const key in formData) {
      form.append(key, formData[key])
    }

    try {
      const response = await fetch(`${ENDPOINT}/user`, {
        method: 'POST',
        body: form,
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error)
        setSuccess(null)
      } else {
        setError(null)
        setSuccess(data.message)
        setTimeout(() => {
          navigate('/base/accordion/Users')
        }, 2000)
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setError('Failed to register user')
      setSuccess(null)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h5 className="mb-0">Add User</h5>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}
        <CForm onSubmit={handleSubmit}>
          <CCol>
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol>
            <CFormLabel>Password</CFormLabel>
            <CFormInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol>
            <CFormLabel>Team</CFormLabel>
            <CFormSelect name="team" value={formData.team} onChange={handleChange} required>
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.ID} value={team.ID}>
                  {team.Name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol>
            <CFormLabel>Role</CFormLabel>
            <CFormSelect name="role" value={formData.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </CFormSelect>
          </CCol>
          <CCol>
            <CFormLabel>Position</CFormLabel>
            <CFormSelect name="position" value={formData.position} onChange={handleChange} required>
              <option value="">Select Position</option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
            </CFormSelect>
          </CCol>
          <CCol>
            <CFormLabel>Picture</CFormLabel>
            <CFormInput type="file" name="picture" accept="image/*" onChange={handleChange} />
          </CCol>
          <CButton type="submit" color="primary">
            <CIcon icon={cilUserPlus} /> Add User
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AddUser
