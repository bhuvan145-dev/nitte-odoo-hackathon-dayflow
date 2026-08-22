import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, parseISO } from 'date-fns'

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern)
}

export const formatTime = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'hh:mm a')
}

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export const generateAttendanceForWeek = (employeeId) => {
  const days = getWeekDays()
  const statuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Leave']
  return days.map((day, idx) => ({
    id: generateId(),
    employeeId,
    date: format(day, 'yyyy-MM-dd'),
    status: statuses[idx],
    checkIn: idx < 5 && statuses[idx] === 'Present' ? '09:00 AM' : null,
    checkOut: idx < 5 && statuses[idx] === 'Present' ? '06:00 PM' : null,
    hoursWorked: idx < 5 && statuses[idx] === 'Present' ? 8 : 0,
  }))
}

export const generateAttendanceForMonth = (employeeId) => {
  const today = new Date()
  const records = []
  for (let i = 29; i >= 0; i--) {
    const day = subDays(today, i)
    const isWeekend = day.getDay() === 0 || day.getDay() === 6
    const random = Math.random()
    let status = 'Present'
    if (isWeekend) status = 'Weekend'
    else if (random < 0.05) status = 'Absent'
    else if (random < 0.1) status = 'Half-day'
    else if (random < 0.15) status = 'Leave'

    records.push({
      id: generateId(),
      employeeId,
      date: format(day, 'yyyy-MM-dd'),
      status,
      checkIn: status === 'Present' || status === 'Half-day' ? `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} AM` : null,
      checkOut: status === 'Present' ? `06:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} PM` : status === 'Half-day' ? `01:${String(Math.floor(Math.random() * 30)).padStart(2, '0')} PM` : null,
      hoursWorked: status === 'Present' ? 8 + (Math.random() - 0.5) : status === 'Half-day' ? 4 : 0,
    })
  }
  return records
}

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateEmployeeId = (id) => {
  return /^[A-Za-z0-9]{3,}$/.test(id)
}
