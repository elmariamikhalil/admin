import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CButton,
  CAvatar,
  CFormInput,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilPlus } from '@coreui/icons'

const ENDPOINT = 'http://localhost:5000'

const Teams = () => {
  const [teams, setTeams] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/teams`)
        const data = await response.json()
        setTeams(data)
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }

    fetchTeams()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleActionClick = (teamId) => {
    navigate(`/base/accordion/EditTeam/${teamId}`)
  }

  const handleCreateTeam = () => {
    navigate('/base/accordion/CreateTeam')
  }

  const filteredTeams = teams.filter((team) =>
    team.Name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Teams</h5>
        <div className="d-flex align-items-center">
          <CFormInput
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            style={{ width: '200px' }}
          />
          <CButton color="primary" className="ml-2" onClick={handleCreateTeam}>
            <CIcon icon={cilPlus} className="mr-1" />
            Create Team
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Members</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTeams.map((team) => (
              <TeamRow key={team.ID} team={team} />
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

const TeamRow = ({ team }) => {
  const [members, setMembers] = useState([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/teams/${team.ID}/members`)
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }

    fetchMembers()
  }, [team.ID])

  const handleActionClick = (teamId) => {
    navigate(`/base/accordion/EditTeam/${teamId}`)
  }

  return (
    <CTableRow>
      <CTableDataCell>{team.Name}</CTableDataCell>
      <CTableDataCell>
        {members.map((member) => (
          <CTooltip key={member.ID} content={`${member.Name} - ${member.Position}`} placement="top">
            <CAvatar
              src={`${ENDPOINT}/uploads/${member.Picture}`}
              alt={member.Name}
              width="30"
              height="30"
              className="mr-2"
            />
          </CTooltip>
        ))}
      </CTableDataCell>
      <CTableDataCell>
        <CButton color="primary" alt="see more" onClick={() => handleActionClick(team.ID)}>
          <CIcon icon={cilFullscreen} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  )
}

export default Teams
