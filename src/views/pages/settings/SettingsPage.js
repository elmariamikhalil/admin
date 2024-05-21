// SettingsPage.js
import React, { useState } from 'react'
import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react'

const SettingsPage = () => {
  const [logoFile, setLogoFile] = useState(null)

  const handleLogoChange = (event) => {
    const file = event.target.files[0]
    setLogoFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // Upload logoFile to backend
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)
      const response = await fetch(`http://localhost:5000/maincompany`, {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        // Logo updated successfully
        console.log({ logoFile })
        alert('Logo updated successfully')
      } else {
        // Handle error
        alert('Failed to update logo')
      }
    } catch (error) {
      console.error('Error updating logo:', error)
      alert('An error occurred while updating logo')
    }
  }

  return (
    <CRow>
      <CCard className="mb-4">
        <CCardHeader>Settings</CCardHeader>
        <CCardBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="logoInput" className="form-label">
                Select logo:
              </label>
              <input
                type="file"
                className="form-control"
                id="logoInput"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Logo
            </button>
          </form>
        </CCardBody>
      </CCard>
    </CRow>
  )
}

export default SettingsPage
