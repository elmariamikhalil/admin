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
} from '@coreui/react'
import Select, { components } from 'react-select'

const ENDPOINT = 'http://localhost:5000'

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('')
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [users, setUsers] = useState([])
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
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/user`)
        if (response.ok) {
          const data = await response.json()
          const groupedData = groupUsersByPosition(data)
          setUsers(groupedData)
        } else {
          console.error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const groupUsersByPosition = (users) => {
    const groups = users.reduce((groups, user) => {
      const group = groups[user.Position] || { label: user.Position, options: [] }
      group.options.push({
        value: user.ID,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={`${ENDPOINT}/uploads/${user.Picture}`}
              alt={user.Name}
              style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 10 }}
            />
            {user.Name}
          </div>
        ),
      })
      groups[user.Position] = group
      return groups
    }, {})

    return Object.values(groups) // Convert the grouped object into an array
  }

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value)
  }

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value)
  }

  const handleMemberChange = (selectedOptions) => {
    setSelectedMembers(selectedOptions.map((option) => option.value))
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
        body: JSON.stringify({ teamName: teamName, clientId: selectedClientId }),
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
      navigate('/base/accordion/Team')
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
              <CFormSelect value={selectedClientId} onChange={handleClientChange}>
                {clients.map((client) => (
                  <option key={client.ID} value={client.ID}>
                    {client.Name}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel>Select Members:</CFormLabel>
              <Select
                isMulti
                options={users}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleMemberChange}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: 'var(--cui-body-bg)',
                    color: 'var(--cui-body-color)',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'var(--cui-body-bg)',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused
                      ? 'var(--cui-secondary-bg)'
                      : 'var(--cui-body-bg)',
                    color: 'var(--cui-body-color)',
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: 'var(--cui-secondary-bg)',
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: 'var(--cui-body-color)',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'var(--cui-body-color)',
                  }),
                }}
                format
                GroupLabel={(data) => (
                  <div style={{ fontWeight: 'bold', color: 'var(--cui-primary-color)' }}>
                    {data.label}
                  </div>
                )}
              />
            </div>

            <CButton type="submit" color="primary" className="mt-3">
              Create Team
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateTeam
