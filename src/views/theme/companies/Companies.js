import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Import useNavigate
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
  CBadge,
  CButton,
  CFormSelect,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilPencil } from '@coreui/icons'

const ENDPOINT = 'http://localhost:5000' // Your server URL

const Companies = () => {
  const [clients, setClients] = useState([])
  const [filter, setFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate() // Corrected import and usage

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/client/`)
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }

    fetchClients()
  }, [])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleViewClick = (clientId) => {
    // Navigate to the company details page
    navigate(`/theme/companies/CompanyDetailPage/${clientId}`)
  }

  const handleEditClick = (clientId) => {
    // Navigate to the edit company details page
    navigate(`/theme/companies/EditCompany/${clientId}`)
  }

  const filteredClients = clients.filter((client) => {
    return (
      (filter ? client.Category === filter : true) &&
      (searchTerm ? client.Name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    )
  })

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Companies</h5>
        <div className="d-flex align-items-center">
          <CFormSelect
            className="me-2"
            style={{ width: '200px' }}
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Key Client">Key Client</option>
            <option value="Client">Client</option>
            <option value="Exit Client">Exit Client</option>
            <option value="On Hold">On Hold</option>
            <option value="SOW">SOW</option>
          </CFormSelect>
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
              <CTableHeaderCell scope="col">Owner</CTableHeaderCell>
              <CTableHeaderCell scope="col">Email</CTableHeaderCell>
              <CTableHeaderCell scope="col">Category</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredClients.map((client) => (
              <CTableRow key={client.Id}>
                <CTableDataCell>{client.Name}</CTableDataCell>
                <CTableDataCell>{client.Owner}</CTableDataCell>
                <CTableDataCell>{client.Email}</CTableDataCell>
                <CTableDataCell>
                  <CBadge
                    color={
                      client.Category === 'Key Client'
                        ? 'success'
                        : client.Category === 'Client'
                          ? 'info'
                          : client.Category === 'Exit Client'
                            ? 'danger'
                            : client.Category === 'On Hold'
                              ? 'warning'
                              : 'primary'
                    }
                    shape="rounded-pill"
                  >
                    {client.Category}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    alt="see more"
                    onClick={() => handleViewClick(client.Id)}
                    className="me-2"
                  >
                    <CIcon icon={cilFullscreen} />
                  </CButton>
                  <CButton color="secondary" alt="edit" onClick={() => handleEditClick(client.Id)}>
                    <CIcon icon={cilPencil} />
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

export default Companies
