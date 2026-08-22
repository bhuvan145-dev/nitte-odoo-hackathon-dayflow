import { motion } from 'framer-motion'
import { Users, CalendarCheck, FileCheck, Wallet, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatCurrency } from '../../utils/helpers.js'

const AdminDashboard = () => {
  const { users } = useAuth()
  const { leaveRequests, attendanceRecords, getPendingLeaves } = useData()
  const employees = users.filter(u => u.role === 'Employee')
  const pendingLeaves = getPendingLeaves()
  const totalPresentToday = attendanceRecords.filter(
    a => a.status === 'Present' && a.date === new Date().toISOString().split('T')[0]
  ).length
  const totalCTC = employees.reduce((s, e) => s + (e.salary || 0), 0)

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50', text: 'text-primary-600' },
    { label: 'Present Today', value: totalPresentToday, icon: CalendarCheck, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Pending Leaves', value: pendingLeaves.length, icon: FileCheck, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Total Monthly CTC', value: formatCurrency(totalCTC / 12), icon: Wallet, color: 'from-brand-500 to-teal-600', bg: 'bg-brand-50', text: 'text-brand-600' }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Admin Dashboard</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">Overview of all HR operations and statistics</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Everything looks good</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-odoo-gray-800">{s.value}</p>
              <p className="text-xs text-odoo-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="section-title">Recent Leave Requests</h2>
          <div className="space-y-3">
            {pendingLeaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-odoo-gray-100">
                <div>
                  <p className="font-medium text-odoo-gray-800 text-sm">{l.employeeName}</p>
                  <p className="text-xs text-odoo-gray-500">{l.leaveType} · {l.days}d</p>
                </div>
                <span className="badge badge-warning">Pending</span>
              </div>
            ))}
            {pendingLeaves.length === 0 && (
              <p className="text-center py-8 text-odoo-gray-400 text-sm">No pending leave requests</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card p-6"
        >
          <h2 className="section-title">Team Directory</h2>
          <div className="space-y-3">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-odoo-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-odoo-gray-800 text-sm truncate">{emp.name}</p>
                  <p className="text-xs text-odoo-gray-500 truncate">{emp.designation} · {emp.department}</p>
                </div>
                <span className="badge badge-success text-[10px]">{emp.employeeId}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
