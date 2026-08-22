import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import {
  apiGetLeaves, apiApplyLeave, apiUpdateLeaveStatus, apiGetLeaveBalance,
  apiGetAttendance, apiCheckIn, apiCheckOut,
} from '../services/api.js'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

export const DataProvider = ({ children }) => {
  const { currentUser, users, refreshUsers } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [lv, at] = await Promise.all([
        apiGetLeaves().catch(() => []),
        apiGetAttendance().catch(() => []),
      ])
      setLeaveRequests(lv)
      setAttendanceRecords(at)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [currentUser?.id, users.length])

  const applyLeave = async (data, employeeId, employeeName) => {
    const r = await apiApplyLeave(data, employeeId, employeeName)
    if (r) {
      setLeaveRequests(prev => [r, ...prev.filter(x => x.id !== r.id)])
      refreshUsers()
    }
    return r
  }

  const updateLeaveStatus = async (leaveId, status, comment = null) => {
    const r = await apiUpdateLeaveStatus(leaveId, status, comment)
    if (r) {
      setLeaveRequests(prev => prev.map(l => l.id === leaveId ? r : l))
      refreshUsers()
      loadAll()
    }
    return r
  }

  const getLeavesForEmployee = (employeeId) =>
    leaveRequests.filter(l => String(l.employeeId) === String(employeeId))

  const getPendingLeaves = () =>
    leaveRequests.filter(l => l.status === 'Pending')

  const getAttendanceForEmployee = (employeeId) =>
    attendanceRecords.filter(a => String(a.employeeId) === String(employeeId))

  const getAttendanceForDate = (employeeId, date) =>
    attendanceRecords.find(a => String(a.employeeId) === String(employeeId) && a.date === date)

  const checkIn = async (employeeId, date, time) => {
    const r = await apiCheckIn(employeeId, date, time)
    if (r) {
      setAttendanceRecords(prev => {
        const idx = prev.findIndex(a => a.id === r.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = r
          return next
        }
        return [r, ...prev]
      })
      refreshUsers()
    }
    return r
  }

  const checkOut = async (employeeId, date, time) => {
    const r = await apiCheckOut(employeeId, date, time)
    if (r) {
      setAttendanceRecords(prev => prev.map(a => a.id === r.id ? r : a))
      refreshUsers()
    }
    return r
  }

  const getAttendanceStats = (employeeId) => {
    const records = getAttendanceForEmployee(employeeId)
    const stats = { Present: 0, Absent: 0, Leave: 0, 'Half-day': 0, Weekend: 0 }
    records.forEach(r => { stats[r.status] = (stats[r.status] || 0) + 1 })
    return stats
  }

  const getLeaveBalance = async (employeeId) => {
    return apiGetLeaveBalance(employeeId)
  }

  return (
    <DataContext.Provider value={{
      leaveRequests,
      attendanceRecords,
      loading,
      reload: loadAll,
      applyLeave,
      updateLeaveStatus,
      getLeavesForEmployee,
      getPendingLeaves,
      getAttendanceForEmployee,
      getAttendanceForDate,
      checkIn,
      checkOut,
      getAttendanceStats,
      getLeaveBalance,
    }}>
      {children}
    </DataContext.Provider>
  )
}
