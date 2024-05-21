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

const EditTeam = () => {
  const { id } = useParams()
  const [team, setTeam] = useState({
    name: '',
    members: [],
  })
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/teams/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch team details')
        }
        const data = await response.json()
        setTeam(data)
      } catch (error) {
        console.error('Error fetching team:', error)
        setError('Failed to fetch team details. Please try again.')
      }
    }

    fetchTeam()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTeam({ ...team, [name]: value })
  }

  const handleMemberChange = (e) => {
    setNewMemberEmail(e.target.value)
  }

  const addMember = () => {
    setTeam({
      ...team,
      members: [...team.members, { email: newMemberEmail, Name: '', Position: '', Role: '' }],
    })
    setNewMemberEmail('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${ENDPOINT}/api/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(team),
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      navigate('/base/accordion/Team')
    } catch (error) {
      console.error('Error updating team:', error)
      setError('Failed to update team. Please try again.')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Edit Team</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit}>
          <div>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              name="name"
              value={team.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <CFormLabel>Members</CFormLabel>
            <ul>
              {team.members.map((member, index) => (
                <li key={index}>{member.email}</li>
              ))}
            </ul>
            <CFormInput
              type="email"
              value={newMemberEmail}
              onChange={handleMemberChange}
              placeholder="Add member by email"
            />
            <CButton type="button" onClick={addMember}>
              Add Member
            </CButton>
          </div>
          <CButton type="submit" color="primary">
            Save Changes
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditTeam
