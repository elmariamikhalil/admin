import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
} from '@coreui/react'

const AddUser = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [role, setRole] = useState('')
  const [teamOptions, setTeamOptions] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    fetchTeamOptions()
  }, [])

  const fetchTeamOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/marabesteam')
      if (response.ok) {
        const data = await response.json()
        setTeamOptions(data.map((team) => ({ value: team.ID, label: team.Name })))
      } else {
        console.error('Failed to fetch teams:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:5000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          name,
          position,
          role,
          team: selectedTeam,
        }),
      })

      if (response.ok) {
        console.log('User added successfully')
        // Clear form fields after successful addition
        setUsername('')
        setPassword('')
        setEmail('')
        setName('')
        setPosition('')
        setRole('')
        setSelectedTeam('')
      } else {
        console.error('Failed to add user:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  return (
    <CCard>
      <CCardHeader>Add User</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CFormLabel htmlFor="username">Username</CFormLabel>
          <CFormInput
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <CFormLabel htmlFor="password">Password</CFormLabel>
          <CFormInput
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <CFormLabel htmlFor="email">Email</CFormLabel>
          <CFormInput
            type="email"
            id="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <CFormLabel htmlFor="name">Name</CFormLabel>
          <CFormInput
            type="text"
            id="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <CFormLabel htmlFor="position">Position</CFormLabel>
          <CFormSelect
            custom
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">Select position</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            {/* Add more options as needed */}
          </CFormSelect>

          <CFormLabel htmlFor="role">Role</CFormLabel>
          <CFormSelect custom id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select role</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            {/* Add more options as needed */}
          </CFormSelect>

          <CFormLabel htmlFor="team">Team</CFormLabel>
          <CFormSelect
            custom
            id="team"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Select team</option>
            {teamOptions.map((team) => (
              <option key={team.value} value={team.value}>
                {team.label}
              </option>
            ))}
          </CFormSelect>
          <CButton type="submit" color="primary">
            Add User
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AddUser
