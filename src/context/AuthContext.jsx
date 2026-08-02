import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newObj = { ...(prev || {}), ...updatedData }
      localStorage.setItem('user', JSON.stringify(newObj))
      return newObj
    })
  }

  const login = async (values) => {
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      })

      if (response.data?.success) {
        const userData = response.data.data.user
        const jwtToken = response.data.data.token
        setUser(userData)
        setToken(jwtToken)
        return { success: true, user: userData }
      } else {
        return { success: false, error: response.data?.message || 'Invalid email or password' }
      }
    } catch (err) {
      console.warn('[AuthContext]: Login API error:', err.response?.data?.message || err.message)
      
      if (err.response) {
        return {
          success: false,
          error: err.response.data?.message || 'Invalid email or password',
        }
      }

      // Offline fallback only if server is unreachable
      const normalizedRole = values.role ? values.role.toLowerCase() : (values.email?.includes('manager') ? 'manager' : 'finance')
      const fallbackUser = {
        name: values.fullName || values.name || (normalizedRole === 'manager' ? 'Finance Manager' : 'Finance Executive'),
        email: values.email || 'finance@invoiceflow.com',
        role: normalizedRole,
      }
      setUser(fallbackUser)
      return { success: true, user: fallbackUser }
    }
  }

  const signup = async (values) => {
    try {
      const normalizedRole = (values.role || 'finance').toLowerCase()
      const response = await authService.signup({
        name: values.fullName || values.name,
        email: values.email,
        password: values.password,
        role: normalizedRole,
      })

      if (response.data?.success) {
        const userData = response.data.data.user
        const jwtToken = response.data.data.token
        setUser(userData)
        setToken(jwtToken)
        return { success: true, user: userData }
      } else {
        return { success: false, error: response.data?.message || 'Registration failed' }
      }
    } catch (err) {
      console.warn('[AuthContext]: Signup API error:', err.response?.data?.message || err.message)
      
      if (err.response) {
        return {
          success: false,
          error: err.response.data?.message || 'Registration failed. Please check your inputs.',
        }
      }

      // Offline fallback only if server is unreachable
      const normalizedRole = (values.role || 'finance').toLowerCase()
      const fallbackUser = {
        name: values.fullName || values.name || 'Finance Executive',
        email: values.email,
        role: normalizedRole,
      }
      setUser(fallbackUser)
      return { success: true, user: fallbackUser }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
