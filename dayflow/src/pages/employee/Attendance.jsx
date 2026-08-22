import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock3,
  LogIn,
  LogOut,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatDate, getWeekDays } from '../../utils/helpers.js'
import { cn } from '../../utils/cn.js'
import { format, addWeeks, subWeeks, isSameDay } from 'date-fns'

const tabOptions = [
  { id: 'daily', label: 'Daily', icon: CalendarDays },
  { id: 'weekly', label: 'Weekly', icon: Calendar }
]

const statusStyles = {
  Present: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    text: 'text-green-700',
    badge: 'badge-success'
  },
  Absent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
    badge: 'badge-danger'
  },
  Leave: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    badge: 'badge-info'
  },
  'Half-day': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    badge: 'badge-warning'
  },
  Weekend: {
    bg: 'bg-odoo-gray-50',
    border: 'border-odoo-gray-200',
    dot: 'bg-odoo-gray-400',
    text: 'text-odoo-gray-500',
    badge: 'badge-secondary'
  }
}

const pieColors = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#9CA3AF']

const Attendance = () => {
  const { currentUser } = useAuth()
  const { getAttendanceForEmployee, getAttendanceForDate, getAttendanceStats, checkIn, checkOut } = useData()
  const [activeTab, setActiveTab] = useState('weekly')
  const [weekOffset, setWeekOffset] = useState(0)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const weekRef = addWeeks(today, weekOffset)
  const weekDays = getWeekDays(weekRef)
  const allRecords = getAttendanceForEmployee(currentUser?.id)
  const stats = getAttendanceStats(currentUser?.id)
  const todayAttendance = getAttendanceForDate(currentUser?.id, todayStr)

  const weeklyAttendance = useMemo(() => {
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const record = allRecords.find(r => r.date === dateStr)
      return {
        date: dateStr,
        dayObj: day,
        ...record
      }
    })
  }, [weekDays, allRecords])

  const weeklyHours = weeklyAttendance.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
  const weeklyPresent = weeklyAttendance.filter(r => r.status === 'Present').length
  const weeklyHalf = weeklyAttendance.filter(r => r.status === 'Half-day').length

  const pieData = useMemo(() => {
    return [
      { name: 'Present', value: stats.Present || 0 },
      { name: 'Absent', value: stats.Absent || 0 },
      { name: 'Half-day', value: stats['Half-day'] || 0 },
      { name: 'Leave', value: stats.Leave || 0 },
      { name: 'Weekend', value: stats.Weekend || 0 }
    ].filter(d => d.value > 0)
  }, [stats])

  const handleCheckIn = () => {
    setCheckingIn(true)
    const time = format(today, 'hh:mm a')
    setTimeout(() => {
      checkIn(currentUser.id, todayStr, time)
      setCheckingIn(false)
    }, 500)
  }

  const handleCheckOut = () => {
    setCheckingOut(true)
    const time = format(today, 'hh:mm a')
    setTimeout(() => {
      checkOut(currentUser.id, todayStr, time)
      setCheckingOut(false)
    }, 500)
  }

  const totalWorkedDays = (stats.Present || 0) + (stats['Half-day'] || 0) * 0.5
  const totalWorkingDays = (stats.Present || 0) + (stats.Absent || 0) + (stats['Half-day'] || 0)
  const attendanceRate = totalWorkingDays > 0 ? Math.round((totalWorkedDays / totalWorkingDays) * 100) : 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Attendance</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">Track and review your attendance records</p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-odoo-gray-100 w-fit">
          {tabOptions.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-odoo-gray-600 hover:text-odoo-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Present', value: stats.Present || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Absent', value: stats.Absent || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Half Days', value: stats['Half-day'] || 0, icon: Clock3, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: BarChart3, color: 'text-primary-600', bg: 'bg-primary-50' }
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-5 h-5', stat.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-odoo-gray-800">{stat.value}</p>
              <p className="text-xs text-odoo-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="card p-6"
              >
                <h2 className="section-title flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-500" />
                  Today's Attendance
                </h2>

                <div className={cn(
                  'rounded-xl p-6 border mb-6',
                  statusStyles[todayAttendance?.status || 'Weekend'].bg,
                  statusStyles[todayAttendance?.status || 'Weekend'].border
                )}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn('w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm')}>
                        {todayAttendance?.status === 'Present' ? (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : todayAttendance?.status === 'Half-day' ? (
                          <Clock3 className="w-8 h-8 text-orange-600" />
                        ) : todayAttendance?.status === 'Absent' ? (
                          <XCircle className="w-8 h-8 text-red-600" />
                        ) : (
                          <Moon className="w-8 h-8 text-odoo-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-odoo-gray-500 mb-1">
                          {formatDate(today, 'EEEE, MMMM dd')}
                        </p>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-odoo-gray-800">Today Status</h3>
                          <span className={cn('badge', statusStyles[todayAttendance?.status || 'Weekend'].badge)}>
                            {todayAttendance?.status || 'Not Marked'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCheckIn}
                        disabled={!!todayAttendance?.checkIn || checkingIn}
                        className="btn-primary min-w-[130px]"
                      >
                        <LogIn className="w-4 h-4" />
                        {checkingIn ? 'Checking...' : 'Check In'}
                      </button>
                      <button
                        onClick={handleCheckOut}
                        disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut || checkingOut}
                        className="btn-secondary min-w-[130px]"
                      >
                        <LogOut className="w-4 h-4" />
                        {checkingOut ? 'Checking...' : 'Check Out'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                      <div className="flex items-center gap-2 text-odoo-gray-500 mb-1.5">
                        <LogIn className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Check In</span>
                      </div>
                      <p className="text-lg font-bold text-odoo-gray-800">{todayAttendance?.checkIn || '--:-- --'}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                      <div className="flex items-center gap-2 text-odoo-gray-500 mb-1.5">
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Check Out</span>
                      </div>
                      <p className="text-lg font-bold text-odoo-gray-800">{todayAttendance?.checkOut || '--:-- --'}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                      <div className="flex items-center gap-2 text-odoo-gray-500 mb-1.5">
                        <Clock3 className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Hours Worked</span>
                      </div>
                      <p className="text-lg font-bold text-odoo-gray-800">
                        {todayAttendance?.hoursWorked ? `${todayAttendance.hoursWorked.toFixed(1)} h` : '0 h'}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-odoo-gray-800 mb-4">Recent Records</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th className="text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRecords.slice(0, 8).map((r) => {
                        const s = statusStyles[r.status] || statusStyles.Weekend
                        return (
                          <tr key={r.id}>
                            <td className="font-medium text-odoo-gray-700">{formatDate(r.date)}</td>
                            <td className="text-odoo-gray-500">{formatDate(r.date, 'EEEE')}</td>
                            <td>
                              <span className="flex items-center gap-2 text-sm">
                                <span className={cn('w-2 h-2 rounded-full', s.dot)} />
                                <span className={s.text}>{r.status}</span>
                              </span>
                            </td>
                            <td className="text-odoo-gray-600">{r.checkIn || '-'}</td>
                            <td className="text-odoo-gray-600">{r.checkOut || '-'}</td>
                            <td className="text-right font-medium text-odoo-gray-800">
                              {r.hoursWorked ? r.hoursWorked.toFixed(1) : 0}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="section-title !mb-0 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Weekly Calendar
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setWeekOffset(w => w - 1)}
                      className="btn-ghost !p-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-odoo-gray-700 bg-odoo-gray-50 rounded-lg min-w-[200px] text-center">
                      {format(weekDays[0], 'MMM dd')} - {format(weekDays[6], 'MMM dd, yyyy')}
                    </span>
                    <button
                      onClick={() => setWeekOffset(w => w + 1)}
                      disabled={weekOffset >= 0}
                      className="btn-ghost !p-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-6">
                  {weeklyAttendance.map((rec, idx) => {
                    const s = statusStyles[rec.status] || statusStyles.Absent
                    const isToday = isSameDay(rec.dayObj, today)
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className={cn(
                          'rounded-xl border-2 p-3 transition-all relative',
                          s.bg,
                          s.border,
                          isToday && 'ring-2 ring-primary-500 ring-offset-2'
                        )}
                      >
                        {isToday && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-primary-600 px-2 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                        <p className="text-[11px] font-bold text-odoo-gray-500 uppercase tracking-wider text-center">
                          {format(rec.dayObj, 'EEE')}
                        </p>
                        <p className={cn('text-2xl font-bold text-center mt-1', s.text)}>
                          {format(rec.dayObj, 'dd')}
                        </p>
                        <div className="mt-2 pt-2 border-t border-white/60">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-odoo-gray-600">
                            <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                            <span className="font-medium">{rec.status || 'Absent'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {weeklyAttendance.map((rec, idx) => {
                    const isWorked = rec.status === 'Present' || rec.status === 'Half-day'
                    return (
                      <motion.div
                        key={`info-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + idx * 0.03 }}
                        className="space-y-2 text-center"
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">In</p>
                          <p className={cn('text-xs font-medium', isWorked ? 'text-green-600' : 'text-odoo-gray-300')}>
                            {rec.checkIn || '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Out</p>
                          <p className={cn('text-xs font-medium', rec.checkOut ? 'text-red-600' : 'text-odoo-gray-300')}>
                            {rec.checkOut || '--'}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-odoo-gray-100">
                          <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Hrs</p>
                          <p className="text-sm font-bold text-odoo-gray-800">
                            {rec.hoursWorked ? rec.hoursWorked.toFixed(1) : '0'}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-odoo-gray-100">
                  <div className="text-center p-3 rounded-xl bg-green-50">
                    <p className="text-2xl font-bold text-green-700">{weeklyPresent}</p>
                    <p className="text-xs text-green-600 mt-0.5">Full Days</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-orange-50">
                    <p className="text-2xl font-bold text-orange-700">{weeklyHalf}</p>
                    <p className="text-xs text-orange-600 mt-0.5">Half Days</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-primary-50">
                    <p className="text-2xl font-bold text-primary-700">{weeklyHours.toFixed(1)}h</p>
                    <p className="text-xs text-primary-600 mt-0.5">Total Hours</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-6 lg:col-span-1"
        >
          <h2 className="section-title flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            Monthly Breakdown
          </h2>

          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-odoo-gray-400">
                <p className="text-sm">No data available</p>
              </div>
            )}
          </div>

          <div className="space-y-2.5 mt-4 pt-4 border-t border-odoo-gray-100">
            {pieData.map((entry, index) => {
              const total = pieData.reduce((s, d) => s + d.value, 0)
              const pct = total ? Math.round((entry.value / total) * 100) : 0
              return (
                <div key={entry.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-odoo-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[index] }} />
                      {entry.name}
                    </span>
                    <span className="font-medium text-odoo-gray-800">{entry.value} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-odoo-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: pieColors[index] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Attendance
