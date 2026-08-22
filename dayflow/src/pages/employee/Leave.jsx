import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarClock,
  Plus,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
  Umbrella,
  Thermometer,
  AlertCircle,
  Coffee
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatDate } from '../../utils/helpers.js'
import { leaveTypes, leaveBalancesTemplate } from '../../data/mockData.js'
import { cn } from '../../utils/cn.js'
import { format, differenceInDays, addDays } from 'date-fns'

const statusBadgeStyles = {
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger'
}

const leaveConfig = [
  { key: 'Paid Leave', icon: Umbrella, gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', bar: 'bg-green-500', text: 'text-green-700' },
  { key: 'Sick Leave', icon: Thermometer, gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-700' },
  { key: 'Unpaid Leave', icon: AlertCircle, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' },
  { key: 'Casual Leave', icon: Coffee, gradient: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', bar: 'bg-violet-500', text: 'text-violet-700' }
]

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

const Leave = () => {
  const { currentUser } = useAuth()
  const { getLeaveBalance, getLeavesForEmployee, applyLeave } = useData()
  const [balance, setBalance] = useState(() => JSON.parse(JSON.stringify(leaveBalancesTemplate)))
  const [balanceLoading, setBalanceLoading] = useState(true)
  const myLeaves = getLeavesForEmployee(currentUser?.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  useEffect(() => {
    if (!currentUser?.id) return
    let active = true
    setBalanceLoading(true)
    getLeaveBalance(currentUser.id)
      .then(b => { if (active) setBalance(b) })
      .finally(() => { if (active) setBalanceLoading(false) })
    return () => { active = false }
  }, [currentUser?.id, applyLeave.length, myLeaves.length])

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: 'Paid Leave',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    remarks: ''
  })
  const [errors, setErrors] = useState({})

  const totalLeavesTaken = useMemo(() => {
    return Object.values(balance).reduce((sum, b) => sum + b.used, 0)
  }, [balance])

  const totalLeavesAllowed = useMemo(() => {
    return Object.values(balance).reduce((sum, b) => sum + b.total, 0)
  }, [balance])

  const calculatedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (end < start) return 0
    return differenceInDays(end, start) + 1
  }, [formData.startDate, formData.endDate])

  const validateForm = () => {
    const errs = {}
    if (!formData.leaveType) errs.leaveType = 'Leave type is required'
    if (!formData.startDate) errs.startDate = 'Start date is required'
    if (!formData.endDate) errs.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errs.endDate = 'End date cannot be before start date'
    }
    if (!formData.remarks.trim()) errs.remarks = 'Please provide remarks'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      await applyLeave(
        {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          days: calculatedDays,
          remarks: formData.remarks
        },
        currentUser.id,
        currentUser.name
      )
      if (currentUser?.id) {
        const b = await getLeaveBalance(currentUser.id)
        setBalance(b)
      }
    } finally {
      setSubmitting(false)
    }
    setShowForm(false)
    setFormData({
      leaveType: 'Paid Leave',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      remarks: ''
    })
    setErrors({})
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Leave Management</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">View balances, apply for leave, and track requests</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {showForm ? 'Hide Form' : 'Apply for Leave'}
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="section-title flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary-600" />
          Leave Balances
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveConfig.map((config, idx) => {
            const Icon = config.icon
            const data = balance[config.key]
            const remaining = data.total - data.used
            const pct = data.total > 0 ? Math.min(100, (data.used / data.total) * 100) : 0
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="card card-hoverable p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-odoo-gray-500">Remaining</p>
                    <p className={cn('text-2xl font-bold', config.text)}>{remaining}</p>
                  </div>
                </div>
                <p className="font-semibold text-odoo-gray-800 mb-1">{config.key}</p>
                <div className="flex items-center justify-between text-xs text-odoo-gray-500 mb-2">
                  <span>{data.used} used</span>
                  <span>{data.total} total</span>
                </div>
                <div className="h-2 bg-odoo-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                    className={cn('h-full rounded-full', config.bar)}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-4 p-5 rounded-xl gradient-brand text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm">Overall Leave Utilization</p>
              <p className="text-3xl font-bold mt-1">
                {totalLeavesTaken} <span className="text-xl text-white/60 font-normal">/ {totalLeavesAllowed} days used</span>
              </p>
            </div>
            <div className="md:w-64">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Progress</span>
                <span>{totalLeavesAllowed > 0 ? Math.round((totalLeavesTaken / totalLeavesAllowed) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalLeavesAllowed > 0 ? Math.min(100, (totalLeavesTaken / totalLeavesAllowed) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="card p-6 border-primary-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-odoo-gray-800 text-lg">Apply for Leave</h2>
                  <p className="text-xs text-odoo-gray-500">Fill in the details below to submit a leave request</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.leaveType}
                      onChange={(e) => handleChange('leaveType', e.target.value)}
                      className={cn('input', errors.leaveType && 'input-error')}
                    >
                      {leaveTypes.map(lt => (
                        <option key={lt} value={lt}>
                          {lt} ({balance[lt]?.total - balance[lt]?.used || 0} remaining)
                        </option>
                      ))}
                    </select>
                    {errors.leaveType && <p className="text-xs text-red-600 mt-1">{errors.leaveType}</p>}
                  </div>

                  <div>
                    <label className="label">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 p-0.5 rounded-lg bg-odoo-gray-50 border border-odoo-gray-100">
                      {[1, 2, 3, 7, 14].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            const s = format(new Date(), 'yyyy-MM-dd')
                            const e = format(addDays(new Date(), d - 1), 'yyyy-MM-dd')
                            handleChange('startDate', s)
                            handleChange('endDate', e)
                          }}
                          className="flex-1 py-1.5 text-xs font-medium rounded-md text-odoo-gray-600 hover:bg-white hover:text-primary-700 transition-colors"
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className={cn('input', errors.startDate && 'input-error')}
                    />
                    {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="label">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className={cn('input', errors.endDate && 'input-error')}
                    />
                    {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="label flex items-center justify-between">
                      <span>
                        Reason / Remarks <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs font-normal text-odoo-gray-400">
                        <CalendarClock className="w-3 h-3 inline mr-1" />
                        {calculatedDays} day{calculatedDays !== 1 ? 's' : ''} requested
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please explain the reason for your leave..."
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      className={cn('input resize-none', errors.remarks && 'input-error')}
                    />
                    {errors.remarks && <p className="text-xs text-red-600 mt-1">{errors.remarks}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setErrors({})
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[140px]">
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title !mb-0 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            Leave History
          </h2>
          <div className="flex items-center gap-4 text-xs text-odoo-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Pending: {myLeaves.filter(l => l.status === 'Pending').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Approved: {myLeaves.filter(l => l.status === 'Approved').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Rejected: {myLeaves.filter(l => l.status === 'Rejected').length}</span>
          </div>
        </div>

        <div className="card overflow-hidden">
          {myLeaves.length === 0 ? (
            <div className="text-center py-16 text-odoo-gray-400">
              <CalendarClock className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No leave requests found</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
                <Plus className="w-4 h-4" /> Apply for First Leave
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th>Days</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Admin Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave, idx) => (
                    <motion.tr
                      key={leave.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <td className="text-odoo-gray-400 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</td>
                      <td>
                        <span className="font-medium text-odoo-gray-800">{leave.leaveType}</span>
                      </td>
                      <td>
                        <div className="text-sm text-odoo-gray-700">
                          {formatDate(leave.startDate)}
                          <span className="text-odoo-gray-300 mx-1">→</span>
                          {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-lg bg-odoo-gray-100 text-sm font-semibold text-odoo-gray-700">
                          {leave.days}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-odoo-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-odoo-gray-600 line-clamp-2">{leave.remarks}</p>
                        </div>
                      </td>
                      <td>
                        <span className={cn('badge', statusBadgeStyles[leave.status], 'gap-1.5')}>
                          {leave.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {leave.status === 'Pending' && <Clock3 className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="text-sm text-odoo-gray-500">{formatDate(leave.createdAt)}</td>
                      <td className="max-w-xs">
                        {leave.adminComments ? (
                          <p className="text-xs text-odoo-gray-500 italic">"{leave.adminComments}"</p>
                        ) : (
                          <span className="text-xs text-odoo-gray-300">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Leave
