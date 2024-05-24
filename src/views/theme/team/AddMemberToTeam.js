import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CButton,
  CAvatar,
  CListGroup,
  CListGroupItem,
  CRow,
  CCol,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000'

const AddMemberToTeam = () => {
  const { clientId } = useParams()
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/teams`)
        if (response.ok) {
          const data = await response.json()
          setTeams(data)
        } else {
          setError('Failed to fetch teams')
        }
      } catch (error) {
        setError('Error fetching teams')
        console.error('Error fetching teams:', error)
      }
    }

    const fetchMembers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/members`)
        if (response.ok) {
          const data = await response.json()
          setMembers(data)
        } else {
          setError('Failed to fetch members')
        }
      } catch (error) {
        setError('Error fetching members')
        console.error('Error fetching members:', error)
      }
    }

    fetchTeams()
    fetchMembers()
  }, [])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedTeamId) return

      try {
        const response = await fetch(`${ENDPOINT}/teams/${selectedTeamId}/members`)
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data)
        } else {
          setError('Failed to fetch team members')
        }
      } catch (error) {
        setError('Error fetching team members')
        console.error('Error fetching team members:', error)
      }
    }

    fetchTeamMembers()
  }, [selectedTeamId])

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value)
  }

  const handleMemberChange = (e) => {
    setSelectedMemberId(e.target.value)
  }

  const handleAddMember = async (e) => {
    e.preventDefault()

    // Check if both team and member are selected
    if (!selectedTeamId || !selectedMemberId) {
      setError('Please select both team and member')
      return
    }

    try {
      const response = await fetch(`${ENDPOINT}/teams/${selectedTeamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: selectedMemberId }),
      })

      if (response.ok) {
        // Refresh the team members list by fetching again
        setSelectedTeamId('')
        setSelectedTeamId(selectedTeamId)
        setError('')
        alert('Member added to team successfully')
      } else {
        setError('Failed to add member to team')
      }
    } catch (error) {
      setError('Error adding member to team')
      console.error('Error adding member to team:', error)
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(`${ENDPOINT}/teams/${selectedTeamId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Member removed from team successfully')
        // Refresh the team members list
        setSelectedTeamId('')
        setSelectedTeamId(selectedTeamId)
      } else {
        setError('Failed to remove member from team')
      }
    } catch (error) {
      setError('Error removing member from team')
      console.error('Error removing member from team:', error)
    }
  }

  const extractInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Add Member to Team</CCardHeader>
        <CCardBody>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <CForm onSubmit={handleAddMember}>
            <CRow>
              <CCol md="6">
                <CFormSelect value={selectedTeamId} onChange={handleTeamChange} required>
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md="6">
                <CFormSelect value={selectedMemberId} onChange={handleMemberChange} required>
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.Id} value={member.Id}>
                      {member.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <CButton type="submit" color="primary" className="mt-3">
              Add Member
            </CButton>
          </CForm>
          <hr />
          <h5>Team Members</h5>
          {teamMembers.length > 0 ? (
            <CListGroup>
              {teamMembers.map((member) => (
                <CListGroupItem
                  key={member.Id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <CAvatar textColor="white" color="primary" className="me-3">
                      {extractInitials(member.name)}
                    </CAvatar>
                    {member.name}
                  </div>
                  <CButton color="danger" size="sm" onClick={() => handleRemoveMember(member.Id)}>
                    Remove
                  </CButton>
                </CListGroupItem>
              ))}
            </CListGroup>
          ) : (
            <p>No members in this team.</p>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AddMemberToTeam
