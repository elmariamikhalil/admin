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
  CAvatar,
} from '@coreui/react'
import Select from 'react-select'

const ENDPOINT = 'http://localhost:5000'

const EditTeam = () => {
  const { id } = useParams()
  const [team, setTeam] = useState({
    name: '',
    members: [],
  })
  const [allMembers, setAllMembers] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamResponse = await fetch(`${ENDPOINT}/api/teams/${id}`)
        if (!teamResponse.ok) {
          throw new Error('Failed to fetch team details')
        }
        const teamData = await teamResponse.json()
        setTeam((prevTeam) => ({ ...prevTeam, name: teamData.Name }))

        const membersResponse = await fetch(`${ENDPOINT}/api/teams/${id}/members`)
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch team members')
        }
        const membersData = await membersResponse.json()
        setTeam((prevTeam) => ({ ...prevTeam, members: membersData.map((member) => member.ID) }))

        const allMembersResponse = await fetch(`${ENDPOINT}/user`)
        if (!allMembersResponse.ok) {
          throw new Error('Failed to fetch all members')
        }
        const allMembersData = await allMembersResponse.json()
        setAllMembers(allMembersData)
      } catch (error) {
        console.error('Error fetching team details:', error)
        setError('Failed to fetch team details. Please try again.')
      }
    }
    fetchTeam()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTeam({ ...team, [name]: value })
  }

  const handleMemberChange = (selectedOptions) => {
    const selectedMembers = selectedOptions.map((option) => option.value)
    setTeam({ ...team, members: selectedMembers })
  }

  const removeMember = (index) => {
    const updatedMembers = [...team.members]
    updatedMembers.splice(index, 1)
    setTeam({ ...team, members: updatedMembers })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Submitting team data:', team) // Debug log

    const modifiedTeam = {
      ...team,
      members: team.members.map(Number), // Convert member IDs to numbers
    }

    try {
      const response = await fetch(`${ENDPOINT}/api/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifiedTeam),
      })

      if (!response.ok) {
        const errorDetails = await response.text()
        throw new Error(`Failed to update team: ${errorDetails}`)
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
            {team.members && team.members.length > 0 ? (
              <ul>
                {team.members.map((memberId, index) => {
                  const member = allMembers.find((m) => m.ID === memberId)
                  return (
                    <div key={memberId}>
                      {member && (
                        <>
                          <CAvatar src={`${ENDPOINT}/uploads/${member.Picture}`} />
                          <p>Name: {member.Name}</p>
                        </>
                      )}
                      <CButton type="button" onClick={() => removeMember(index)} color="danger">
                        Remove
                      </CButton>
                    </div>
                  )
                })}
              </ul>
            ) : (
              <p>No members added</p>
            )}
            <Select
              isMulti
              options={
                allMembers
                  ? allMembers.map((member) => ({
                      value: member.ID,
                      label: member.Name,
                    }))
                  : []
              }
              value={team.members.map((memberId) => {
                const member = allMembers.find((m) => m.ID === memberId)
                return member ? { value: member.ID, label: member.Name } : null
              })}
              onChange={handleMemberChange}
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

export default EditTeam
