import { createContext, useContext, useState, useEffect } from 'react'
import {
  apiSignIn, apiSignUp, apiGetCurrentUser, apiSignOut,
  apiUpdateProfile, apiUpdateEmployee, apiGetAllUsers,
  checkOdooAvailable, checkExpressAvailable, dataMode
} from '../services/api.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState({ mode: 'local', odooVersion: null, checked: false })

  useEffect(() => {
    const init = async () => {
      const expressAvail = await checkExpressAvailable()
      let mode = expressAvail.available ? 'express' : 'local'
      let version = null
      if (!expressAvail.available) {
        const avail = await checkOdooAvailable()
        if (avail.available) { mode = 'odoo'; version = avail.version }
      }
      setBackendStatus({
        mode,
        odooVersion: version,
        expressVersion: expressAvail.version,
        expressTotals: expressAvail.totals,
        checked: true,
      })
      const stored = apiGetCurrentUser()
      if (stored) setCurrentUser(stored)
      const all = await apiGetAllUsers()
      if (all.length) setUsers(all)
      setLoading(false)
    }
    init()
  }, [])

  const signUp = async (data) => {
    const res = await apiSignUp(data)
    if (res.success) {
      const all = await apiGetAllUsers()
      setUsers(all)
    }
    return res
  }

  const signIn = async (email, password) => {
    const res = await apiSignIn(email, password)
    if (res.success) {
      setCurrentUser(res.user)
      const all = await apiGetAllUsers()
      setUsers(all)
    }
    return res
  }

  const signOut = async () => {
    await apiSignOut()
    setCurrentUser(null)
  }

  const updateProfile = async (updatedUser) => {
    const u = await apiUpdateProfile(updatedUser)
    if (u) {
      setCurrentUser(u)
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x))
    }
    return u
  }

  const updateEmployee = async (employeeId, updates) => {
    const u = await apiUpdateEmployee(employeeId, updates)
    if (u) setUsers(prev => prev.map(x => x.id === employeeId ? { ...x, ...updates } : x))
    return u
  }

  const updateSalary = async (employeeId, newSalary) => {
    return updateEmployee(employeeId, { salary: newSalary })
  }

  const isHR = () => currentUser?.role === 'HR'
  const isEmployee = () => currentUser?.role === 'Employee'

  const refreshUsers = async () => {
    const all = await apiGetAllUsers()
    setUsers(all)
    return all
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loading,
      backendStatus,
      dataMode,
      refreshUsers,
      signUp,
      signIn,
      signOut,
      updateProfile,
      updateEmployee,
      updateSalary,
      isHR,
      isEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
