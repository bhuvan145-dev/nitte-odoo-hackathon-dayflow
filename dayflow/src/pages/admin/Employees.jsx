import { motion } from 'framer-motion'
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../../utils/helpers.js'

const AdminEmployees = () => {
  const { users } = useAuth()
  const employees = users.filter(u => u.role === 'Employee')

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Employees</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">Manage all team members ({employees.length} total)</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
            <input placeholder="Search employees..." className="input pl-9 w-full md:w-64" />
          </div>
          <button className="btn-primary"><Plus className="w-4 h-4" /> Add</button>
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
                <th>Department</th>
                <th>Contact</th>
                <th>Joining</th>
                <th>Salary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
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
                        <p className="text-xs text-odoo-gray-500">{emp.employeeId} · {emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="chip bg-primary-50 text-primary-700">
                      <Building2 className="w-3 h-3 mr-1" /> {emp.department}
                    </span>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-xs text-odoo-gray-600">
                        <Mail className="w-3 h-3" />{emp.email}
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1 text-xs text-odoo-gray-500">
                          <Phone className="w-3 h-3" />{emp.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-odoo-gray-600">{emp.joiningDate ? formatDate(emp.joiningDate) : '-'}</td>
                  <td>
                    <p className="text-sm font-semibold text-odoo-gray-800">{formatCurrency(emp.salary)}</p>
                    <p className="text-[11px] text-odoo-gray-400">per annum</p>
                  </td>
                  <td className="text-right">
                    <button className="btn-ghost !p-2"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminEmployees
