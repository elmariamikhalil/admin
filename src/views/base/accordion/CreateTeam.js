import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CCol,
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CFormCheck,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000'

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('')
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const navigate = useNavigate()

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
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/user`)
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

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value)
  }

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value)
  }

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!teamName || !selectedClientId) {
      alert('Please enter team name and select a client')
      return
    }

    try {
      const response = await fetch(`${ENDPOINT}/marabesteam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName, clientId: selectedClientId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const teamData = await response.json()

      await fetch(`${ENDPOINT}/marabesteam/${teamData.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberIds: selectedMembers }),
      })

      alert('Team created successfully')
      navigate('/base/accordion/Teams')
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Error creating team')
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Create Team</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormLabel>Team Name:</CFormLabel>
              <CFormInput type="text" value={teamName} onChange={handleTeamNameChange} required />
            </div>

            <div className="mb-3">
              <CFormLabel>Client:</CFormLabel>
              <CFormSelect value={selectedClientId} onChange={handleClientChange} required>
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.ID} value={client.ID}>
                    {client.Name}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <CCol>
              <CFormLabel>Select Members:</CFormLabel>
              <CListGroup>
                {members.map((member) => (
                  <CListGroupItem key={member.ID}>
                    <CFormCheck
                      id={`member-${member.ID}`}
                      label={member.Name}
                      checked={selectedMembers.includes(member.ID)}
                      onChange={() => handleMemberToggle(member.ID)}
                    />
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCol>

            <CButton type="submit" color="primary">
              Create Team
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateTeam
