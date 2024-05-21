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
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen } from '@coreui/icons'

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

  const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
              <CTableRow key={team.team_id}>
                <CTableDataCell>{team.team_name}</CTableDataCell>
                <CTableDataCell>
                  {team.members.map((member) => member.Name).join(', ')}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    alt="see more"
                    onClick={() => handleActionClick(team.team_id)}
                  >
                    <CIcon icon={cilFullscreen} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default Teams
