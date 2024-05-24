import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000'

const AddTeamToClient = () => {
  const [clients, setClients] = useState([])
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/client`)
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        } else {
          console.error('Failed to fetch clients')
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/members`)
        if (response.ok) {
          const data = await response.json()
          setMembers(data)
        } else {
          console.error('Failed to fetch members')
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
    }

    fetchMembers()
  }, [])

  useEffect(() => {
    if (!selectedClientId) return

    const fetchTeams = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/clients/${selectedClientId}/teams`)
        if (response.ok) {
          const data = await response.json()
          setTeams(data)
        } else {
          console.error('Failed to fetch teams')
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }

    fetchTeams()
  }, [selectedClientId])

  useEffect(() => {
    if (!selectedTeamId) return

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/teams/${selectedTeamId}/members`)
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data)
          setSelectedMembers(data.map((member) => member.Id))
        } else {
          console.error('Failed to fetch team members')
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }

    fetchTeamMembers()
  }, [selectedTeamId])

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value)
    setSelectedTeamId('')
    setTeamName('')
    setTeamMembers([])
    setSelectedMembers([])
  }

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value)
    const team = teams.find((team) => team.id === parseInt(e.target.value))
    setTeamName(team ? team.name : '')
  }

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value)
  }

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((Id) => Id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedTeamId) {
      // Update existing team
      const response = await fetch(`${ENDPOINT}/teams/${selectedTeamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName, memberIds: selectedMembers }),
      })

      if (response.ok) {
        alert('Team updated successfully')
      } else {
        alert('Failed to update team')
      }
    } else {
      // Add new team
      const response = await fetch(`${ENDPOINT}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName, clientId: selectedClientId }),
      })
      const teamData = await response.json()

      // Assign members to team
      await fetch(`${ENDPOINT}/teams/${teamData.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberIds: selectedMembers }),
      })

      alert('Team and members added successfully')
    }

    // Refresh teams list
    setSelectedClientId('')
    setSelectedClientId(selectedClientId)
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Add Team to Client</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CFormSelect
              className="mb-3"
              value={selectedClientId}
              onChange={handleClientChange}
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.Id} value={client.Id}>
                  {client.Name}
                </option>
              ))}
            </CFormSelect>

            <CFormSelect className="mb-3" value={selectedTeamId} onChange={handleTeamChange}>
              <option value="">Select Team (or create new)</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </CFormSelect>

            <div className="mb-3">
              <label>Team Name:</label>
              <input
                type="text"
                className="form-control"
                value={teamName}
                onChange={handleTeamNameChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Members:</label>
              <div className="d-flex flex-wrap">
                {members.map((member) => (
                  <CAvatar
                    key={member.Id}
                    textColor="white"
                    color={selectedMembers.includes(member.Id) ? 'primary' : 'secondary'}
                    className="me-2 mb-2"
                    onClick={() => handleMemberToggle(member.Id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {extractInitials(member.name)}
                  </CAvatar>
                ))}
              </div>
            </div>

            <CButton type="submit" color="primary">
              {selectedTeamId ? 'Update Team' : 'Add Team'}
            </CButton>
          </CForm>

          {selectedTeamId && teamMembers.length > 0 && (
            <>
              <h5 className="mt-4">Team Members</h5>
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
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

const extractInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
}

export default AddTeamToClient
