import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IndianRupee,
  Search,
  ChevronDown,
  Edit3,
  Eye,
  X,
  Check,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Receipt,
  Building2,
  Briefcase,
  IdCard,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../../utils/helpers.js'
import { cn } from '../../utils/cn.js'
import { salaryComponents } from '../../data/mockData.js'

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, type: 'spring', damping: 25 } }
}

const slipVariants = {
  hidden: { opacity: 0, x: '100%' },
  show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } }
}

const Payroll = () => {
  const { users, updateSalary } = useAuth()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [deptDropOpen, setDeptDropOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(null)
  const [editCTC, setEditCTC] = useState('')
  const [slipOpen, setSlipOpen] = useState(null)
  const [toast, setToast] = useState(null)

  const employees = useMemo(() => users.filter(u => u.role === 'Employee'), [users])

  const calcSalaryBreakdown = (annualCTC) => {
    const ctc = Number(annualCTC) || 0
    const monthly = ctc / 12
    const basic = Math.round(monthly * salaryComponents.basic)
    const hra = Math.round(monthly * salaryComponents.hra)
    const specialAllowance = Math.round(monthly * salaryComponents.specialAllowance)
    const conveyance = Math.round(monthly * salaryComponents.conveyance)
    const medical = Math.round(monthly * salaryComponents.medical)
    const epf = Math.round(basic * salaryComponents.epf)
    const esi = Math.round(monthly * salaryComponents.esi)
    const pt = Math.round(salaryComponents.professionalTax / 12)
    const gross = basic + hra + specialAllowance + conveyance + medical
    const totalDeductions = epf + esi + pt
    const netPay = gross - totalDeductions
    return {
      annualCTC: ctc,
      monthlyCTC: Math.round(monthly),
      basic, hra, specialAllowance, conveyance, medical,
      gross,
      epf, esi, pt,
      totalDeductions,
      netPay
    }
  }

  const payrollData = useMemo(() => {
    return employees.map(emp => ({
      emp,
      breakdown: calcSalaryBreakdown(emp.salary || 0)
    }))
  }, [employees])

  const departments = useMemo(() => {
    const set = new Set()
    employees.forEach(e => e.department && set.add(e.department))
    return Array.from(set)
  }, [employees])

  const filtered = useMemo(() => {
    let arr = payrollData
    if (deptFilter !== 'all') arr = arr.filter(p => p.emp.department === deptFilter)
    const s = search.toLowerCase().trim()
    if (s) arr = arr.filter(p =>
      p.emp.name.toLowerCase().includes(s) ||
      p.emp.employeeId.toLowerCase().includes(s) ||
      (p.emp.designation || '').toLowerCase().includes(s)
    )
    return arr
  }, [payrollData, deptFilter, search])

  const totals = useMemo(() => {
    const base = filtered.reduce(
      (acc, p) => {
        acc.annualCTC += p.breakdown.annualCTC
        acc.basic += p.breakdown.basic * 12
        acc.hra += p.breakdown.hra * 12
        acc.gross += p.breakdown.gross * 12
        acc.deductions += p.breakdown.totalDeductions * 12
        acc.net += p.breakdown.netPay * 12
        return acc
      },
      { annualCTC: 0, basic: 0, hra: 0, gross: 0, deductions: 0, net: 0 }
    )
    return base
  }, [filtered])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openEdit = (item) => {
    setEditModalOpen(item)
    setEditCTC(String(item.emp.salary || 0))
  }
  const closeEdit = () => {
    setEditModalOpen(null)
    setEditCTC('')
  }

  const saveSalary = async () => {
    const val = Number(editCTC)
    if (isNaN(val) || val < 0) {
      showToast('Enter a valid CTC', 'error')
      return
    }
    await updateSalary(editModalOpen.emp.id, val)
    closeEdit()
    showToast('Salary updated successfully')
  }

  const liveBreakdown = useMemo(() => calcSalaryBreakdown(editCTC), [editCTC])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-odoo-gray-800">Payroll</h1>
          <p className="text-sm text-odoo-gray-500 mt-1">Manage employee compensation and generate salary slips.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-primary-500/10 -translate-y-10 translate-x-10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-odoo-gray-500 uppercase tracking-wider mb-2">
              <IndianRupee className="w-3.5 h-3.5" /> Total Annual CTC
            </div>
            <div className="stat-value !text-2xl">{formatCurrency(totals.annualCTC)}</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-odoo-green">
              <TrendingUp className="w-3.5 h-3.5" />
              {filtered.length} employees
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-brand-500/10 -translate-y-10 translate-x-10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-odoo-gray-500 uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" /> Basic (Annual)
            </div>
            <div className="stat-value !text-2xl">{formatCurrency(totals.basic)}</div>
            <div className="mt-2 text-xs text-odoo-gray-500">
              {((totals.basic / (totals.annualCTC || 1)) * 100).toFixed(1)}% of CTC
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-odoo-red/10 -translate-y-10 translate-x-10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-odoo-gray-500 uppercase tracking-wider mb-2">
              <TrendingDown className="w-3.5 h-3.5" /> Total Deductions
            </div>
            <div className="stat-value !text-2xl text-odoo-red">{formatCurrency(totals.deductions)}</div>
            <div className="mt-2 text-xs text-odoo-gray-500">
              EPF + ESI + Professional Tax
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-odoo-green/10 -translate-y-10 translate-x-10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-odoo-gray-500 uppercase tracking-wider mb-2">
              <Receipt className="w-3.5 h-3.5" /> Annual Net Pay
            </div>
            <div className="stat-value !text-2xl text-odoo-green">{formatCurrency(totals.net)}</div>
            <div className="mt-2 text-xs text-odoo-gray-500">
              Per month: {formatCurrency(Math.round(totals.net / 12))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, designation..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDeptDropOpen(o => !o)}
              className="input w-full text-left flex items-center justify-between gap-2"
            >
              <span className="truncate text-odoo-gray-700">
                {deptFilter === 'all' ? 'All Departments' : deptFilter}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-odoo-gray-400 flex-shrink-0 transition-transform', deptDropOpen && 'rotate-180')} />
            </button>
            {deptDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-lg border border-odoo-gray-200 shadow-lg max-h-60 overflow-y-auto animate-fade-in"
              >
                <button
                  onClick={() => { setDeptFilter('all'); setDeptDropOpen(false) }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-odoo-gray-50 border-b border-odoo-gray-100',
                    deptFilter === 'all' && 'bg-primary-50 text-primary-700 font-medium'
                  )}
                >
                  All Departments
                </button>
                {departments.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDeptFilter(d); setDeptDropOpen(false) }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-odoo-gray-50',
                      deptFilter === d && 'bg-primary-50 text-primary-700 font-medium'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-odoo-gray-100 flex items-center justify-between">
          <div>
            <h3 className="section-title !mb-0">Payroll Summary</h3>
            <p className="text-xs text-odoo-gray-500">{filtered.length} employee{filtered.length !== 1 ? 's' : ''} • Monthly figures</p>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[62vh]">
          <table className="table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th>Employee</th>
                <th className="text-right">Annual CTC</th>
                <th className="text-right">Basic</th>
                <th className="text-right">HRA</th>
                <th className="text-right">Total Earnings</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Net Pay</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-odoo-gray-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No payroll records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const { emp, breakdown } = row
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.015 }}
                      onClick={() => setSlipOpen(row)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-brand-400 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-odoo-gray-800 truncate">{emp.name}</div>
                            <div className="text-xs text-odoo-gray-500 truncate">
                              <span className="font-mono">{emp.employeeId}</span> • {emp.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-medium text-odoo-gray-700 whitespace-nowrap">{formatCurrency(breakdown.annualCTC)}</td>
                      <td className="text-right text-odoo-gray-700 whitespace-nowrap">{formatCurrency(breakdown.basic)}</td>
                      <td className="text-right text-odoo-gray-700 whitespace-nowrap">{formatCurrency(breakdown.hra)}</td>
                      <td className="text-right font-semibold text-brand-600 whitespace-nowrap">{formatCurrency(breakdown.gross)}</td>
                      <td className="text-right font-medium text-odoo-red whitespace-nowrap">-{formatCurrency(breakdown.totalDeductions)}</td>
                      <td className="text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-100 text-green-700 font-bold text-sm whitespace-nowrap">
                          {formatCurrency(breakdown.netPay)}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSlipOpen(row) }}
                            className="btn-ghost !p-2"
                            title="View Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                            className="btn-ghost !p-2 hover:!bg-primary-50 hover:!text-primary-600"
                            title="Edit Salary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="absolute inset-0 bg-odoo-gray-900/50"
              onClick={closeEdit}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-odoo-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-brand-50">
                <div>
                  <h2 className="font-semibold text-lg text-odoo-gray-800 flex items-center gap-2">
                    <Edit3 className="w-4.5 h-4.5 text-primary-600" />
                    Edit Salary
                  </h2>
                  <p className="text-xs text-odoo-gray-500 mt-0.5">{editModalOpen.emp.name} • {editModalOpen.emp.employeeId}</p>
                </div>
                <button onClick={closeEdit} className="btn-ghost !p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="label">Annual CTC (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
                    <input
                      type="number"
                      className="input pl-9 !text-base !font-semibold"
                      value={editCTC}
                      onChange={(e) => setEditCTC(e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-odoo-gray-50 border border-odoo-gray-100 text-sm">
                  <div>
                    <div className="text-xs text-odoo-gray-500 mb-1">Monthly CTC</div>
                    <div className="font-semibold text-odoo-gray-800">{formatCurrency(liveBreakdown.monthlyCTC)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-odoo-gray-500 mb-1">Basic</div>
                    <div className="font-semibold text-odoo-gray-800">{formatCurrency(liveBreakdown.basic)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-odoo-gray-500 mb-1">Gross Earnings</div>
                    <div className="font-semibold text-brand-600">{formatCurrency(liveBreakdown.gross)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-odoo-gray-500 mb-1">Deductions</div>
                    <div className="font-semibold text-odoo-red">{formatCurrency(liveBreakdown.totalDeductions)}</div>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-odoo-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-odoo-gray-700">Net Pay (Monthly)</span>
                      <span className="text-xl font-bold text-odoo-green">{formatCurrency(liveBreakdown.netPay)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-odoo-gray-100 flex gap-3 justify-end">
                <button onClick={closeEdit} className="btn-secondary">Cancel</button>
                <button onClick={saveSalary} className="btn-primary">
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {slipOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="fixed inset-0 z-40 bg-odoo-gray-900/40"
              onClick={() => setSlipOpen(null)}
            />
            <motion.aside
              variants={slipVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] bg-odoo-gray-50 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-odoo-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white flex items-center justify-center shadow-md">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-odoo-gray-800">Salary Slip</h2>
                    <p className="text-xs text-odoo-gray-500">{formatDate(new Date(), 'MMMM yyyy')}</p>
                  </div>
                </div>
                <button onClick={() => setSlipOpen(null)} className="btn-ghost !p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                <div className="bg-white rounded-xl border border-odoo-gray-100 p-5 shadow-card">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-odoo-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                      {slipOpen.emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-odoo-gray-800 truncate">{slipOpen.emp.name}</h3>
                      <p className="text-sm text-odoo-gray-500 truncate">{slipOpen.emp.designation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-odoo-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-odoo-gray-500">Employee ID</div>
                        <div className="font-medium text-odoo-gray-800 font-mono">{slipOpen.emp.employeeId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-odoo-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-odoo-gray-500">Department</div>
                        <div className="font-medium text-odoo-gray-800">{slipOpen.emp.department || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-odoo-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-odoo-gray-500">Designation</div>
                        <div className="font-medium text-odoo-gray-800">{slipOpen.emp.designation || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-odoo-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-odoo-gray-500">Joining</div>
                        <div className="font-medium text-odoo-gray-800">{slipOpen.emp.joiningDate ? formatDate(slipOpen.emp.joiningDate) : '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-odoo-gray-100 overflow-hidden shadow-card">
                  <div className="px-5 py-3 bg-gradient-to-r from-brand-50 to-green-50 border-b border-brand-100/50 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <h4 className="font-semibold text-brand-700">Earnings</h4>
                  </div>
                  <div className="divide-y divide-odoo-gray-100">
                    {[
                      ['Basic Salary', slipOpen.breakdown.basic],
                      ['House Rent Allowance (HRA)', slipOpen.breakdown.hra],
                      ['Special Allowance', slipOpen.breakdown.specialAllowance],
                      ['Conveyance Allowance', slipOpen.breakdown.conveyance],
                      ['Medical Allowance', slipOpen.breakdown.medical]
                    ].map(([label, value]) => (
                      <div key={label} className="px-5 py-3 flex items-center justify-between text-sm">
                        <span className="text-odoo-gray-600">{label}</span>
                        <span className="font-semibold text-odoo-gray-800">{formatCurrency(value)}</span>
                      </div>
                    ))}
                    <div className="px-5 py-3 bg-gradient-to-r from-brand-50/50 to-transparent flex items-center justify-between">
                      <span className="font-semibold text-odoo-gray-800">Gross Earnings</span>
                      <span className="font-bold text-lg text-brand-600">{formatCurrency(slipOpen.breakdown.gross)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-odoo-gray-100 overflow-hidden shadow-card">
                  <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100/50 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-odoo-red" />
                    <h4 className="font-semibold text-odoo-red">Deductions</h4>
                  </div>
                  <div className="divide-y divide-odoo-gray-100">
                    {[
                      ['Employee PF (EPF)', slipOpen.breakdown.epf],
                      ['Employee State Insurance (ESI)', slipOpen.breakdown.esi],
                      ['Professional Tax', slipOpen.breakdown.pt]
                    ].map(([label, value]) => (
                      <div key={label} className="px-5 py-3 flex items-center justify-between text-sm">
                        <span className="text-odoo-gray-600">{label}</span>
                        <span className="font-semibold text-odoo-gray-800">-{formatCurrency(value)}</span>
                      </div>
                    ))}
                    <div className="px-5 py-3 bg-gradient-to-r from-red-50/50 to-transparent flex items-center justify-between">
                      <span className="font-semibold text-odoo-gray-800">Total Deductions</span>
                      <span className="font-bold text-lg text-odoo-red">-{formatCurrency(slipOpen.breakdown.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-500 to-brand-500 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-10" />
                  <div className="relative">
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Net Pay (Monthly)</div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(slipOpen.breakdown.netPay)}</div>
                    <div className="text-sm opacity-80 flex items-center gap-3">
                      <span>Annual CTC: {formatCurrency(slipOpen.breakdown.annualCTC)}</span>
                      <span>•</span>
                      <span>Per Annum Net: {formatCurrency(slipOpen.breakdown.netPay * 12)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-odoo-gray-200 bg-white flex gap-3 flex-shrink-0">
                <button className="btn-secondary flex-1" onClick={() => setSlipOpen(null)}>
                  <FileText className="w-4 h-4" /> Close
                </button>
                <button className="btn-primary flex-1" onClick={() => openEdit(slipOpen)}>
                  <Edit3 className="w-4 h-4" /> Edit Salary
                </button>
              </div>
            </motion.aside>
          </>
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

export default Payroll
