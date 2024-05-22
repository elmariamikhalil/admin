import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAvatar,
  CBadge,
  CImage,
  CTableBody,
  CTableRow,
  CNav,
  CNavItem,
  CNavLink,
  CTableDataCell,
  CTable,
} from '@coreui/react'

const ENDPOINT = 'http://localhost:5000' // Your server URL

const CompanyDetailPage = () => {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${ENDPOINT}/client/${clientId}`)
        const data = await response.json()
        setClient(data)
      } catch (error) {
        console.error('Error fetching company details:', error)
      }
    }

    fetchCompanyDetails()
  }, [clientId])

  const extractInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
  }

  return (
    <>
      {client && (
        <>
          <CRow>
            <CCol sm={8}>
              <CCard>
                <CCardHeader>Company Logo</CCardHeader>
                <CCardBody>
                  <CRow className="align-items-center">
                    <CCol md="6">
                      <CImage
                        src={`${ENDPOINT}/uploads/${client.Logo}`}
                        alt="Client Logo"
                        rounded
                        thumbnail
                        width="200"
                        height="200"
                      />
                    </CCol>
                    <CCol md="6">
                      <CAvatar color="primary" textColor="white">
                        {extractInitials(client.Owner)}
                      </CAvatar>
                      {client.Owner}
                    </CCol>
                  </CRow>
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
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={4}>
              <CCard>
                <CCardHeader>Team</CCardHeader>
                <CCardBody>
                  <div>
                    <CAvatar color="primary" textColor="white">
                      A
                    </CAvatar>
                    Team Member 1
                  </div>
                  <div>
                    <CAvatar color="primary" textColor="white">
                      B
                    </CAvatar>
                    Team Member 2
                  </div>
                  <div>
                    <CAvatar color="primary" textColor="white">
                      C
                    </CAvatar>
                    Team Member 3
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CRow class="mb">
            <CCol xs={4}>
              <CCard>
                <CCardHeader>Pie Chart</CCardHeader>
                <CCardBody>{/* Placeholder for Pie Chart */}</CCardBody>
              </CCard>
            </CCol>
            <CCol sm={8}>
              <CCard>
                <CCardHeader>
                  <CNav variant="tabs">
                    <CNavItem>
                      <CNavLink>Administration</CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>Back Office</CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>Audit</CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>Advisory</CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>Year Work</CNavLink>
                    </CNavItem>
                  </CNav>
                </CCardHeader>
                <CCardBody>
                  <CTable>
                    <CTableBody>
                      <CTableRow>
                        <CTableDataCell></CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

export default CompanyDetailPage
