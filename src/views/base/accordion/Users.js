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
  CFormInput,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen } from '@coreui/icons'

const ENDPOINT = 'http://localhost:5000'

const Users = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/user`)
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleActionClick = (id) => {
    navigate(`/Base/accordion/EditUser/${id}`)
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Users</h5>
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
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Email</CTableHeaderCell>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Picture</CTableHeaderCell>
              <CTableHeaderCell scope="col">Position</CTableHeaderCell>
              <CTableHeaderCell scope="col">Role</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.Id}>
                <CTableDataCell>{user.Id}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.name}</CTableDataCell>
                <CTableDataCell>
                  <img src={user.Picture} alt="User" style={{ width: '50px', height: '50px' }} />
                </CTableDataCell>
                <CTableDataCell>{user.Position}</CTableDataCell>
                <CTableDataCell>{user.Role}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" alt="edit" onClick={() => handleActionClick(user.Id)}>
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

export default Users
