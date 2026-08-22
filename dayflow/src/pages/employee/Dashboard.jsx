import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  CalendarCheck,
  CalendarClock,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock3,
  LogIn,
  LogOut,
  FileText,
  ChevronRight,
  Gauge
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatDate, formatTime } from '../../utils/helpers.js'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

const getStatusBadge = (status) => {
  const styles = {
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-danger'
  }
  return <span className={`badge ${styles[status] || 'badge-secondary'}`}>{status}</span>
}

const Dashboard = () => {
  const { currentUser } = useAuth()
  const {
    getAttendanceForDate,
    getAttendanceStats,
    getLeavesForEmployee,
    checkIn,
    checkOut
  } = useData()

  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = getAttendanceForDate(currentUser?.id, today)
  const stats = getAttendanceStats(currentUser?.id)
  const myLeaves = getLeavesForEmployee(currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const handleCheckIn = async () => {
    setCheckingIn(true)
    const time = formatTime(new Date())
    try {
      await checkIn(currentUser.id, today, time)
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    const time = formatTime(new Date())
    try {
      await checkOut(currentUser.id, today, time)
    } finally {
      setCheckingOut(false)
    }
  }

  const quickCards = [
    {
      label: 'Profile',
      icon: User,
      to: '/profile',
      gradient: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50',
      text: 'text-primary-600'
    },
    {
      label: 'Attendance',
      icon: CalendarCheck,
      to: '/attendance',
      gradient: 'from-brand-500 to-brand-600',
      bg: 'bg-brand-50',
      text: 'text-brand-600'
    },
    {
      label: 'Leave',
      icon: CalendarClock,
      to: '/leave',
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600'
    },
    {
      label: 'Payroll',
      icon: Wallet,
      to: '/payroll',
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">
            {getGreeting()}, {currentUser?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">
            Welcome back! Here's a quick overview of your day.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-odoo-gray-500">
          <Gauge className="w-4 h-4" />
          <span>{formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} to={card.to}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="card card-hoverable p-5 group"
              >
                <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-odoo-gray-800 text-sm">{card.label}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-odoo-gray-500">
                  <span>View details</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title !mb-0">Today's Attendance</h2>
            <Link to="/attendance" className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className={`p-5 rounded-xl mb-5 ${
            todayAttendance?.status === 'Present'
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100'
              : todayAttendance?.status === 'Half-day'
              ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100'
              : 'bg-gradient-to-br from-odoo-gray-50 to-slate-50 border border-odoo-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-odoo-gray-600">Current Status</span>
              {todayAttendance?.status ? (
                <span className={`badge ${
                  todayAttendance.status === 'Present' ? 'badge-success' :
                  todayAttendance.status === 'Half-day' ? 'badge-warning' : 'badge-secondary'
                }`}>
                  {todayAttendance.status}
                </span>
              ) : (
                <span className="badge badge-secondary">Not Checked In</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/70 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-odoo-gray-500 mb-1">
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="text-xs">Check In</span>
                </div>
                <p className="font-semibold text-odoo-gray-800">
                  {todayAttendance?.checkIn || '--:-- --'}
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-odoo-gray-500 mb-1">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-xs">Check Out</span>
                </div>
                <p className="font-semibold text-odoo-gray-800">
                  {todayAttendance?.checkOut || '--:-- --'}
                </p>
              </div>
            </div>
            {todayAttendance?.hoursWorked > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-odoo-gray-600">
                <Clock3 className="w-4 h-4 text-brand-600" />
                <span>Hours worked: <strong>{todayAttendance.hoursWorked.toFixed(1)}h</strong></span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn || checkingIn}
              className="btn-primary !py-3 flex-col gap-1"
            >
              <LogIn className="w-4 h-4" />
              <span>{checkingIn ? 'Checking in...' : 'Check In'}</span>
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut || checkingOut}
              className="btn-secondary !py-3 flex-col gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span>{checkingOut ? 'Checking out...' : 'Check Out'}</span>
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6 lg:col-span-1">
          <h2 className="section-title">Attendance Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-odoo-gray-700">Present</p>
                  <p className="text-xs text-odoo-gray-500">Full days worked</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-700">{stats.Present || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-odoo-gray-700">Half-day</p>
                  <p className="text-xs text-odoo-gray-500">Partial attendance</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-700">{stats['Half-day'] || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-odoo-gray-700">Absent</p>
                  <p className="text-xs text-odoo-gray-500">Days missed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-700">{stats.Absent || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title !mb-0">Recent Leaves</h2>
            <Link to="/leave" className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          {myLeaves.length === 0 ? (
            <div className="text-center py-8 text-odoo-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((leave) => (
                <motion.div
                  key={leave.id}
                  whileHover={{ x: 4 }}
                  className="p-3 rounded-lg border border-odoo-gray-100 hover:border-odoo-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-odoo-gray-800">{leave.leaveType}</span>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-odoo-gray-500">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                    <span className="ml-auto font-medium text-odoo-gray-700">{leave.days}d</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
