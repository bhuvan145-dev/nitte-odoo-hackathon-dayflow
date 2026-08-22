import { motion } from 'framer-motion'
import { CalendarCheck, Search, Download, CheckCircle2, XCircle, Clock3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatDate } from '../../utils/helpers.js'

const AdminAttendance = () => {
  const { users } = useAuth()
  const { attendanceRecords, getAttendanceStats } = useData()
  const employees = users.filter(u => u.role === 'Employee')

  const getTodayStats = (empId) => {
    const today = new Date().toISOString().split('T')[0]
    return attendanceRecords.find(a => a.employeeId === empId && a.date === today)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Attendance</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">Team attendance records and overview for {formatDate(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
            <input placeholder="Search..." className="input pl-9 w-full md:w-52" />
          </div>
          <button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Today</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Monthly (Present/Absent/Half)</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const today = getTodayStats(emp.id)
                const stats = getAttendanceStats(emp.id)
                return (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-odoo-gray-800 text-sm">{emp.name}</p>
                          <p className="text-xs text-odoo-gray-500">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {today?.status === 'Present' && <span className="badge badge-success gap-1"><CheckCircle2 className="w-3 h-3" />Present</span>}
                      {today?.status === 'Half-day' && <span className="badge badge-warning gap-1"><Clock3 className="w-3 h-3" />Half</span>}
                      {today?.status === 'Absent' && <span className="badge badge-danger gap-1"><XCircle className="w-3 h-3" />Absent</span>}
                      {!today && <span className="badge badge-secondary">No Record</span>}
                    </td>
                    <td className="text-sm text-odoo-gray-600">{today?.checkIn || '-'}</td>
                    <td className="text-sm text-odoo-gray-600">{today?.checkOut || '-'}</td>
                    <td className="text-sm font-medium text-odoo-gray-800">{today?.hoursWorked ? `${today.hoursWorked.toFixed(1)}h` : '-'}</td>
                    <td>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="chip bg-green-50 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />{stats.Present || 0}</span>
                        <span className="chip bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />{stats.Absent || 0}</span>
                        <span className="chip bg-orange-50 text-orange-700"><Clock3 className="w-3 h-3 mr-1" />{stats['Half-day'] || 0}</span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminAttendance
