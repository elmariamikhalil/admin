import React, { Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const AddUsers = React.lazy(() => import('./views/pages/addusers/AddUsers'))

/*const AuthRedirect = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/user/verifyToken`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setIsAuthenticated(true)
            setUserRole(data.role)
            dispatch({ type: 'LOGIN_SUCCESS', payload: data })
          } else {
            setIsAuthenticated(false)
            navigate('/login')
          }
        } catch (error) {
          console.error('Error verifying token:', error)
          setIsAuthenticated(false)
          navigate('/login')
        }
      } else {
        setIsAuthenticated(false)
        navigate('/login')
      }
    }
    checkAuthentication()
  }, [navigate, dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'Admin') {
        navigate('/')
      } else {
        alert('You do not have access to this application.')
        navigate('/login')
      }
    }
  }, [isAuthenticated, userRole, navigate])

  return null
}*/

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      {/*<AuthRedirect />*/}
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/addusers" name="Add Users Page" element={<AddUsers />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
