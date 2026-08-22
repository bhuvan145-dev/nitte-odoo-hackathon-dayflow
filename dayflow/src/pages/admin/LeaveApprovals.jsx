import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  XCircle,
  User,
  CalendarDays,
  FileText,
  MessageSquare,
  Check,
  X,
  Sun,
  ThermometerSun,
  Wallet,
  CalendarRange,
  AlertCircle,
  ChevronDown,
  Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatDate } from '../../utils/helpers.js'
import { cn } from '../../utils/cn.js'

const TABS = [
  { id: 'pending', label: 'Pending', icon: Clock, countKey: 'pending' },
  { id: 'approved', label: 'Approved', icon: CheckCircle2, countKey: 'approved' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, countKey: 'rejected' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } }
}

const leaveTypeConfig = {
  'Paid Leave': { icon: Wallet, cls: 'bg-green-100 text-green-700', bar: 'bg-odoo-green' },
  'Sick Leave': { icon: ThermometerSun, cls: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  'Unpaid Leave': { icon: Wallet, cls: 'bg-orange-100 text-orange-700', bar: 'bg-odoo-orange' },
  'Casual Leave': { icon: Sun, cls: 'bg-purple-100 text-purple-700', bar: 'bg-primary-500' }
}

const LeaveApprovals = () => {
  const { users } = useAuth()
  const { leaveRequests, updateLeaveStatus } = useData()

  const [activeTab, setActiveTab] = useState('pending')
  const [commentOpen, setCommentOpen] = useState({})
  const [comment, setComment] = useState({})
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const categorized = useMemo(() => {
    const p = [], a = [], r = []
    leaveRequests.forEach(l => {
      if (l.status === 'Pending') p.push(l)
      else if (l.status === 'Approved') a.push(l)
      else if (l.status === 'Rejected') r.push(l)
    })
    return {
      pending: p.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)),
      approved: a.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)),
      rejected: r.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    }
  }, [leaveRequests])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openComment = (id, mode) => {
    setCommentOpen(c => ({ ...c, [id]: mode }))
    setComment(c => ({ ...c, [id]: '' }))
  }

  const closeComment = (id) => {
    setCommentOpen(c => ({ ...c, [id]: null }))
    setComment(c => ({ ...c, [id]: '' }))
  }

  const doAction = async (leave, status) => {
    const text = comment[leave.id]?.trim() || null
    await updateLeaveStatus(leave.id, status, text)
    closeComment(leave.id)
    showToast(`Leave ${status.toLowerCase()} successfully`)
  }

  const current = categorized[activeTab] || []

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (!s) return current
    return current.filter(l =>
      l.employeeName?.toLowerCase().includes(s) ||
      (l.leaveType || '').toLowerCase().includes(s) ||
      (l.remarks || '').toLowerCase().includes(s)
    )
  }, [current, search])

  const counts = {
    pending: categorized.pending.length,
    approved: categorized.approved.length,
    rejected: categorized.rejected.length
  }

  const renderCard = (leave) => {
    const emp = users.find(u => u.id === leave.employeeId)
    const tConfig = leaveTypeConfig[leave.leaveType] || leaveTypeConfig['Casual Leave']
    const TIcon = tConfig.icon
    const isPending = activeTab === 'pending'
    const openMode = commentOpen[leave.id]

    return (
      <motion.div
        key={leave.id}
        variants={itemVariants}
        className="card p-5 relative overflow-hidden group"
      >
        <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', tConfig.bar)} />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-brand-400 text-white font-semibold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
              {leave.employeeName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-odoo-gray-800 truncate">{leave.employeeName}</h4>
              <div className="text-xs text-odoo-gray-500 mt-0.5 flex items-center gap-1.5">
                <span>{emp?.employeeId}</span>
                <span className="w-1 h-1 rounded-full bg-odoo-gray-300" />
                <span className="truncate">{emp?.department}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={cn('chip', tConfig.cls)}>
              <TIcon className="w-3 h-3" />
              {leave.leaveType}
            </span>
            {activeTab !== 'pending' && (
              <span className={cn(
                'badge',
                activeTab === 'approved' ? 'badge-success' : 'badge-danger'
              )}>
                {activeTab === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {leave.status}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-odoo-gray-50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-odoo-gray-500 uppercase tracking-wider mb-1">
              <CalendarRange className="w-3 h-3" /> Dates
            </div>
            <div className="text-sm font-semibold text-odoo-gray-800 leading-tight">
              {formatDate(leave.startDate, 'MMM dd')} → {formatDate(leave.endDate, 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-odoo-gray-50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-odoo-gray-500 uppercase tracking-wider mb-1">
              <CalendarDays className="w-3 h-3" /> Duration
            </div>
            <div className="text-sm font-semibold text-odoo-gray-800 leading-tight">
              {leave.days} day{leave.days > 1 ? 's' : ''}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-odoo-gray-50 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-odoo-gray-500 uppercase tracking-wider mb-1">
              <FileText className="w-3 h-3" /> Applied on
            </div>
            <div className="text-sm font-semibold text-odoo-gray-800 leading-tight">
              {formatDate(leave.createdAt)}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50/60 to-brand-50/60 border border-primary-100/50 mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-primary-700 uppercase tracking-wider mb-1">Employee Remarks</div>
              <p className="text-sm text-odoo-gray-700 leading-relaxed">
                {leave.remarks || <span className="text-odoo-gray-400 italic">No remarks provided.</span>}
              </p>
            </div>
          </div>
        </div>

        {leave.adminComments && (
          <div className="p-3 rounded-xl bg-odoo-gray-50 border border-odoo-gray-200 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-odoo-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-odoo-gray-600 uppercase tracking-wider mb-1">
                  {leave.status === 'Approved' ? 'Approval' : 'Rejection'} Note
                </div>
                <p className="text-sm text-odoo-gray-700 leading-relaxed">{leave.adminComments}</p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isPending && openMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-odoo-gray-50 border border-odoo-gray-200 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-odoo-gray-600 block mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {openMode === 'approve' ? 'Approval Comment (optional)' : 'Rejection Reason (optional)'}
                  </label>
                  <textarea
                    className="input min-h-[72px] resize-none"
                    placeholder={openMode === 'approve' ? 'Enjoy your leave!' : 'Please provide reason...'}
                    value={comment[leave.id] || ''}
                    onChange={(e) => setComment(c => ({ ...c, [leave.id]: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="btn-secondary" onClick={() => closeComment(leave.id)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    className={openMode === 'approve' ? 'btn-success' : 'btn-danger'}
                    onClick={() => doAction(leave, openMode === 'approve' ? 'Approved' : 'Rejected')}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirm {openMode === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isPending && !openMode && (
          <div className="flex gap-2">
            <button
              onClick={() => openComment(leave.id, 'approve')}
              className="btn-success flex-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => openComment(leave.id, 'reject')}
              className="btn-danger flex-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => openComment(leave.id, commentOpen[leave.id] === 'approve' ? null : 'approve')}
              className="btn-secondary !p-2"
              title="Add comment first"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Leave Approvals</h1>
          <p className="text-sm text-odoo-gray-500 mt-1">Review and manage employee leave requests.</p>
        </div>
      </div>

      <div className="card p-1.5 flex flex-col sm:flex-row gap-2 bg-odoo-gray-50 border-0">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = counts[tab.countKey]
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-white text-odoo-gray-800 shadow-card'
                  : 'text-odoo-gray-600 hover:text-odoo-gray-800 hover:bg-white/60'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && tab.id === 'pending' && 'animate-pulse-soft')} />
              {tab.label}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                isActive
                  ? tab.id === 'pending' ? 'bg-orange-100 text-orange-700'
                  : tab.id === 'approved' ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  : 'bg-odoo-gray-200 text-odoo-gray-600'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab} requests...`}
          className="input pl-9 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-16 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-brand-100 flex items-center justify-center">
              {activeTab === 'pending' ? <Clock className="w-10 h-10 text-primary-500" />
                : activeTab === 'approved' ? <CheckCircle2 className="w-10 h-10 text-odoo-green" />
                : <XCircle className="w-10 h-10 text-odoo-red" />}
            </div>
            <h3 className="text-lg font-semibold text-odoo-gray-800 mb-1">
              No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests
            </h3>
            <p className="text-sm text-odoo-gray-500 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'All caught up! There are no pending leave requests waiting for your review.'
                : activeTab === 'approved'
                ? 'No approved leave requests in this category yet.'
                : 'No rejected leave requests yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {filtered.map(renderCard)}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium text-white',
              toast.type === 'error' ? 'bg-odoo-red' : 'bg-odoo-green'
            )}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LeaveApprovals
