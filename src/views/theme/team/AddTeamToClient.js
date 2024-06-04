import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CButton,
  CAlert,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000'

const AddTeamToClient = () => {
  const [clients, setClients] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [assignedTeam, setAssignedTeam] = useState(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/clients`)
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
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/marabesteam`)
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
  }, [])

  useEffect(() => {
    const fetchAssignedTeam = async () => {
      try {
        if (!selectedClientId) return
        const response = await fetch(`${ENDPOINT}/clientteam/${selectedClientId}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.TeamID) {
            setSelectedTeamId(data.TeamID) // Set the selected team to the assigned team
          } else {
            setSelectedTeamId('Select Team') // Reset selected team if no team is assigned
          }
        } else {
          console.error('Failed to fetch assigned team')
        }
      } catch (error) {
        console.error('Error fetching assigned team:', error)
      }
    }

    fetchAssignedTeam()
  }, [selectedClientId])

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value)
    setSelectedTeamId('')
  }

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value)
    setAssignedTeam(e.target.value !== 'Select Team' ? e.target.value : null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedTeamId) {
      // Update existing team - Send a POST request instead of PUT
      const response = await fetch(`${ENDPOINT}/clientteam/${selectedClientId}`, {
        method: 'POST', // Change method to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ TeamID: selectedTeamId }), // Use selectedTeamId
      })

      if (response.ok) {
        alert('Team assigned to client successfully')
        setAssignedTeam(selectedTeamId)
      } else {
        alert('Failed to assign team to client')
      }
    } else {
      // Handle if no team is selected
      alert('Please select a team')
    }
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
                <option key={client.ID} value={client.ID}>
                  {' '}
                  {client.Name}
                </option>
              ))}
            </CFormSelect>

            {assignedTeam !== null && assignedTeam !== 'Select Team' ? (
              <div className="mb-3">
                {teams.map((team) => (
                  <CAlert color="info">Team assigned to this client: {team.Name}</CAlert>
                ))}
              </div>
            ) : (
              <div className="mb-3">
                <CAlert color="warning">No team is assigned to this client</CAlert>
              </div>
            )}

            <CFormSelect className="mb-3" value={selectedTeamId} onChange={handleTeamChange}>
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.ID} value={team.ID}>
                  {' '}
                  {team.Name}
                </option>
              ))}
            </CFormSelect>

            <CButton type="submit" color="primary">
              Assign Team to Client
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AddTeamToClient
