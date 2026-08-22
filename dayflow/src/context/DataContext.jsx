import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { generateDefaultLeaveRequests, generateDefaultAttendance } from '../data/mockData.js'
import { generateId } from '../utils/helpers.js'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

const LEAVES_KEY = 'dayflow_leaves'
const ATTENDANCE_KEY = 'dayflow_attendance'

export const DataProvider = ({ children }) => {
  const { users } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])

  useEffect(() => {
    if (users.length === 0) return

    const storedLeaves = localStorage.getItem(LEAVES_KEY)
    if (!storedLeaves) {
      const defaults = generateDefaultLeaveRequests(users)
      localStorage.setItem(LEAVES_KEY, JSON.stringify(defaults))
      setLeaveRequests(defaults)
    } else {
      setLeaveRequests(JSON.parse(storedLeaves))
    }

    const storedAttendance = localStorage.getItem(ATTENDANCE_KEY)
    if (!storedAttendance) {
      const defaults = generateDefaultAttendance(users)
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(defaults))
      setAttendanceRecords(defaults)
    } else {
      setAttendanceRecords(JSON.parse(storedAttendance))
    }
  }, [users.length])

  const updateLeavesStorage = (newLeaves) => {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(newLeaves))
    setLeaveRequests(newLeaves)
  }

  const updateAttendanceStorage = (newRecords) => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(newRecords))
    setAttendanceRecords(newRecords)
  }

  const applyLeave = (data, employeeId, employeeName) => {
    const newRequest = {
      id: generateId(),
      employeeId,
      employeeName,
      status: 'Pending',
      adminComments: null,
      createdAt: new Date().toISOString().split('T')[0],
      ...data
    }
    const newLeaves = [newRequest, ...leaveRequests]
    updateLeavesStorage(newLeaves)
    return newRequest
  }

  const updateLeaveStatus = (leaveId, status, comment = null) => {
    const newLeaves = leaveRequests.map(l =>
      l.id === leaveId
        ? { ...l, status, adminComments: comment || l.adminComments }
        : l
    )
    updateLeavesStorage(newLeaves)
    return newLeaves.find(l => l.id === leaveId)
  }

  const getLeavesForEmployee = (employeeId) => {
    return leaveRequests.filter(l => l.employeeId === employeeId)
  }

  const getPendingLeaves = () => {
    return leaveRequests.filter(l => l.status === 'Pending')
  }

  const getAttendanceForEmployee = (employeeId) => {
    return attendanceRecords.filter(a => a.employeeId === employeeId)
  }

  const getAttendanceForDate = (employeeId, date) => {
    return attendanceRecords.find(a => a.employeeId === employeeId && a.date === date)
  }

  const checkIn = (employeeId, date, time) => {
    const existing = getAttendanceForDate(employeeId, date)
    if (existing) {
      const updated = attendanceRecords.map(a =>
        a.id === existing.id ? { ...a, checkIn: time, status: 'Present' } : a
      )
      updateAttendanceStorage(updated)
      return updated.find(a => a.id === existing.id)
    }
    const newRecord = {
      id: generateId(),
      employeeId,
      date,
      status: 'Present',
      checkIn: time,
      checkOut: null,
      hoursWorked: 0
    }
    const newRecords = [newRecord, ...attendanceRecords]
    updateAttendanceStorage(newRecords)
    return newRecord
  }

  const checkOut = (employeeId, date, time) => {
    const existing = getAttendanceForDate(employeeId, date)
    if (!existing) return null
    const updated = attendanceRecords.map(a => {
      if (a.id === existing.id) {
        const checkInDate = new Date(`${a.date} ${a.checkIn}`)
        const checkOutDate = new Date(`${a.date} ${time}`)
        const hours = Math.max(0, (checkOutDate - checkInDate) / (1000 * 60 * 60))
        const status = hours < 4 ? 'Half-day' : hours >= 4 ? 'Present' : a.status
        return { ...a, checkOut: time, hoursWorked: parseFloat(hours.toFixed(2)), status }
      }
      return a
    })
    updateAttendanceStorage(updated)
    return updated.find(a => a.id === existing.id)
  }

  const getAttendanceStats = (employeeId) => {
    const records = getAttendanceForEmployee(employeeId)
    const stats = { Present: 0, Absent: 0, Leave: 0, 'Half-day': 0, Weekend: 0 }
    records.forEach(r => { stats[r.status] = (stats[r.status] || 0) + 1 })
    return stats
  }

  const getLeaveBalance = (employeeId) => {
    const balances = {
      'Paid Leave': { total: 15, used: 0 },
      'Sick Leave': { total: 10, used: 0 },
      'Unpaid Leave': { total: 30, used: 0 },
      'Casual Leave': { total: 12, used: 0 }
    }
    const approved = leaveRequests.filter(
      l => l.employeeId === employeeId && l.status === 'Approved'
    )
    approved.forEach(l => {
      if (balances[l.leaveType]) {
        balances[l.leaveType].used += l.days
      }
    })
    return balances
  }

  return (
    <DataContext.Provider value={{
      leaveRequests,
      attendanceRecords,
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
