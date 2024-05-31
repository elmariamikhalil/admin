import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CImage,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import { sygnet } from 'src/assets/brand/sygnet'

const AppSidebar = () => {
  const [logoUrl, setLogoUrl] = useState('')
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    fetch('http://localhost:5000/maincompany')
      .then((response) => response.json())
      .then((maincompany) => {
        const fetchedLogoUrl = `http://localhost:5000/uploads/${maincompany.Logo}`
        setLogoUrl(fetchedLogoUrl)
      })
      .catch((error) => console.error('Error fetching company data:', error))
  }, [])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          {logoUrl ? (
            <CImage src={logoUrl} width="auto" height={40} />
          ) : (
            <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
          )}
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
