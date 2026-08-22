import { createContext, useContext, useState, useEffect } from 'react'
import { defaultUsers } from '../data/mockData.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

const STORAGE_KEY = 'dayflow_auth'
const USERS_KEY = 'dayflow_users'

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY)
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
      setUsers(defaultUsers)
    } else {
      setUsers(JSON.parse(storedUsers))
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const updateUsersStorage = (newUsers) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers))
    setUsers(newUsers)
  }

  const signUp = ({ employeeId, name, email, password, role, phone }) => {
    const existingEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingEmail) {
      return { success: false, error: 'Email is already registered' }
    }
    const existingEmpId = users.find(u => u.employeeId.toUpperCase() === employeeId.toUpperCase())
    if (existingEmpId) {
      return { success: false, error: 'Employee ID already exists' }
    }
    const newUser = {
      id: `emp-${Date.now()}`,
      employeeId: employeeId.toUpperCase(),
      name,
      email,
      password,
      role: role || 'Employee',
      phone: phone || '',
      address: '',
      dob: '',
      gender: '',
      department: role === 'HR' ? 'Human Resources' : 'Engineering',
      designation: role === 'HR' ? 'HR Executive' : 'Software Engineer',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 500000,
      profilePicture: null,
      createdAt: new Date().toISOString().split('T')[0]
    }
    const newUsers = [...users, newUser]
    updateUsersStorage(newUsers)
    return { success: true, user: newUser }
  }

  const signIn = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, error: 'Email not found' }
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setCurrentUser(user)
    return { success: true, user }
  }

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }

  const updateProfile = (updatedUser) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)
    updateUsersStorage(newUsers)
    if (currentUser && currentUser.id === updatedUser.id) {
      const newCurrent = { ...currentUser, ...updatedUser }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCurrent))
      setCurrentUser(newCurrent)
    }
    return newUsers.find(u => u.id === updatedUser.id)
  }

  const updateEmployee = (employeeId, updates) => {
    const newUsers = users.map(u => u.id === employeeId ? { ...u, ...updates } : u)
    updateUsersStorage(newUsers)
    return newUsers.find(u => u.id === employeeId)
  }

  const updateSalary = (employeeId, newSalary) => {
    return updateEmployee(employeeId, { salary: newSalary })
  }

  const isHR = () => currentUser?.role === 'HR'
  const isEmployee = () => currentUser?.role === 'Employee'

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loading,
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
