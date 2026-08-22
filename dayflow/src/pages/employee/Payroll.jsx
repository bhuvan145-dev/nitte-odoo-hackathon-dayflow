import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Receipt,
  PiggyBank,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Calendar,
  Building2,
  ChevronRight,
  BadgeCheck,
  ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../../utils/helpers.js'
import { cn } from '../../utils/cn.js'
import { format } from 'date-fns'

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

const Payroll = () => {
  const { currentUser } = useAuth()

  const salary = currentUser?.salary || 500000

  const breakdown = useMemo(() => {
    const ctcAnnual = salary
    const ctcMonthly = ctcAnnual / 12

    const basicAnnual = ctcAnnual * 0.4
    const hraAnnual = ctcAnnual * 0.2
    const conveyanceAnnual = ctcAnnual * 0.05
    const medicalAnnual = ctcAnnual * 0.05
    const specialAnnual = ctcAnnual * 0.15
    const grossAnnual = basicAnnual + hraAnnual + conveyanceAnnual + medicalAnnual + specialAnnual
    const grossMonthly = grossAnnual / 12

    const epfAnnual = basicAnnual * 0.12
    const esiAnnual = ctcAnnual * 0.0075
    const professionalTaxAnnual = 2500
    const totalDeductionsAnnual = epfAnnual + esiAnnual + professionalTaxAnnual
    const totalDeductionsMonthly = totalDeductionsAnnual / 12

    const netAnnual = grossAnnual - totalDeductionsAnnual
    const netMonthly = netAnnual / 12

    return {
      ctc: { annual: ctcAnnual, monthly: ctcMonthly },
      earnings: {
        basic: { annual: basicAnnual, monthly: basicAnnual / 12, pct: 40 },
        hra: { annual: hraAnnual, monthly: hraAnnual / 12, pct: 20 },
        conveyance: { annual: conveyanceAnnual, monthly: conveyanceAnnual / 12, pct: 5 },
        medical: { annual: medicalAnnual, monthly: medicalAnnual / 12, pct: 5 },
        special: { annual: specialAnnual, monthly: specialAnnual / 12, pct: 15 },
        gross: { annual: grossAnnual, monthly: grossMonthly }
      },
      deductions: {
        epf: { annual: epfAnnual, monthly: epfAnnual / 12, pct: 12, base: 'Basic' },
        esi: { annual: esiAnnual, monthly: esiAnnual / 12, pct: 0.75, base: 'CTC' },
        professionalTax: { annual: professionalTaxAnnual, monthly: professionalTaxAnnual / 12 },
        total: { annual: totalDeductionsAnnual, monthly: totalDeductionsMonthly }
      },
      net: { annual: netAnnual, monthly: netMonthly }
    }
  }, [salary])

  const currentMonth = format(new Date(), 'MMMM yyyy')
  const payDate = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'MMM dd, yyyy')

  const earningsRows = [
    { label: 'Basic Salary', pct: '40%', icon: DollarSign, data: breakdown.earnings.basic, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50' },
    { label: 'House Rent Allowance (HRA)', pct: '20%', icon: Building2, data: breakdown.earnings.hra, color: 'from-brand-500 to-brand-600', bg: 'bg-brand-50' },
    { label: 'Conveyance Allowance', pct: '5%', icon: Briefcase, data: breakdown.earnings.conveyance, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Medical Allowance', pct: '5%', icon: ShieldCheck, data: breakdown.earnings.medical, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
    { label: 'Special Allowance', pct: '15%', icon: TrendingUp, data: breakdown.earnings.special, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' }
  ]

  const deductionsRows = [
    { label: 'Employee Provident Fund (EPF)', note: '12% of Basic', icon: PiggyBank, data: breakdown.deductions.epf, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Employee State Insurance (ESI)', note: '0.75% of CTC', icon: ShieldCheck, data: breakdown.deductions.esi, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50' },
    { label: 'Professional Tax', note: 'Fixed p.a.', icon: Receipt, data: breakdown.deductions.professionalTax, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' }
  ]

  const summaryCards = [
    {
      label: 'Annual CTC',
      value: breakdown.ctc.annual,
      subValue: `Monthly: ${formatCurrency(breakdown.ctc.monthly)}`,
      icon: Wallet,
      gradient: 'from-primary-600 to-brand-500',
      tag: 'Total Package'
    },
    {
      label: 'Gross Salary',
      value: breakdown.earnings.gross.annual,
      subValue: `Monthly: ${formatCurrency(breakdown.earnings.gross.monthly)}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      tag: 'Before Deductions'
    },
    {
      label: 'Total Deductions',
      value: breakdown.deductions.total.annual,
      subValue: `Monthly: ${formatCurrency(breakdown.deductions.total.monthly)}`,
      icon: TrendingDown,
      gradient: 'from-rose-500 to-red-600',
      tag: 'Annual'
    },
    {
      label: 'Net Take-home',
      value: breakdown.net.annual,
      subValue: `Monthly: ${formatCurrency(breakdown.net.monthly)}`,
      icon: CreditCard,
      gradient: 'from-violet-600 to-purple-700',
      tag: 'In Hand',
      highlight: true
    }
  ]

  const pastPayslips = [
    { month: 'July 2026', status: 'Paid', date: '2026-07-31', amount: breakdown.net.monthly },
    { month: 'June 2026', status: 'Paid', date: '2026-06-30', amount: breakdown.net.monthly },
    { month: 'May 2026', status: 'Paid', date: '2026-05-31', amount: breakdown.net.monthly },
    { month: 'April 2026', status: 'Paid', date: '2026-04-30', amount: breakdown.net.monthly },
    { month: 'March 2026', status: 'Paid', date: '2026-03-31', amount: breakdown.net.monthly }
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
          <h1 className="text-2xl font-bold text-odoo-gray-800">Payroll</h1>
          <p className="text-odoo-gray-500 mt-1 text-sm">View your salary details, breakdowns, and payslips</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="chip bg-brand-50 text-brand-700">
            <Calendar className="w-3 h-3 mr-1" />
            {currentMonth}
          </span>
          <span className="chip bg-green-50 text-green-700">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={cn(
                'relative overflow-hidden rounded-2xl p-5 text-white',
                card.highlight
                  ? 'shadow-xl scale-[1.02] ring-2 ring-white/20'
                  : 'shadow-card',
                `bg-gradient-to-br ${card.gradient}`
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/15 border border-white/20">
                    {card.tag}
                  </span>
                </div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-2xl lg:text-3xl font-bold">{formatCurrency(card.value)}</p>
                <p className="text-white/60 text-xs mt-2">{card.subValue}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="card lg:col-span-2 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-odoo-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-brand-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-odoo-gray-800">Salary Slip — {currentMonth}</h2>
                <p className="text-xs text-odoo-gray-500 mt-0.5 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-green-600" />
                  Pay Date: {payDate}
                </p>
              </div>
            </div>
            <button className="btn-secondary gap-1.5">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>

          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-odoo-gray-50 bg-odoo-gray-50/50">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Employee</p>
              <p className="text-sm font-medium text-odoo-gray-800">{currentUser?.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Employee ID</p>
              <p className="text-sm font-medium text-odoo-gray-800">{currentUser?.employeeId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Designation</p>
              <p className="text-sm font-medium text-odoo-gray-800">{currentUser?.designation}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 mb-0.5">Department</p>
              <p className="text-sm font-medium text-odoo-gray-800">{currentUser?.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-b md:border-b-0 md:border-r border-odoo-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-odoo-gray-800 uppercase tracking-wide text-sm">Earnings</h3>
              </div>
              <div className="space-y-3.5">
                {earningsRows.map((row, i) => {
                  const Icon = row.icon
                  return (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-odoo-gray-50 transition-colors group"
                    >
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', row.bg)}>
                        <Icon className={cn('w-4 h-4 bg-gradient-to-br bg-clip-text', row.color)} style={{ WebkitTextFill: 'transparent' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-odoo-gray-800 truncate">{row.label}</p>
                        <p className="text-[11px] text-odoo-gray-400">{row.pct} of CTC</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-odoo-gray-800">{formatCurrency(row.data.monthly)}</p>
                        <p className="text-[11px] text-odoo-gray-400">{formatCurrency(row.data.annual)} / yr</p>
                      </div>
                    </motion.div>
                  )
                })}
                <div className="pt-3 mt-3 border-t border-dashed border-odoo-gray-200">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                    <div>
                      <p className="text-xs text-green-700 uppercase tracking-wider font-semibold">Gross Earnings</p>
                      <p className="text-[11px] text-green-600">Before any deductions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">{formatCurrency(breakdown.earnings.gross.monthly)}</p>
                      <p className="text-[11px] text-green-600">{formatCurrency(breakdown.earnings.gross.annual)} / yr</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-odoo-gray-800 uppercase tracking-wide text-sm">Deductions</h3>
              </div>
              <div className="space-y-3.5">
                {deductionsRows.map((row, i) => {
                  const Icon = row.icon
                  return (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-odoo-gray-50 transition-colors"
                    >
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', row.bg)}>
                        <Icon className="w-4 h-4 text-odoo-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-odoo-gray-800 truncate">{row.label}</p>
                        <p className="text-[11px] text-odoo-gray-400">{row.note}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-red-600">- {formatCurrency(row.data.monthly)}</p>
                        <p className="text-[11px] text-odoo-gray-400">{formatCurrency(row.data.annual)} / yr</p>
                      </div>
                    </motion.div>
                  )
                })}
                <div className="pt-3 mt-3 border-t border-dashed border-odoo-gray-200">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
                    <div>
                      <p className="text-xs text-red-700 uppercase tracking-wider font-semibold">Total Deductions</p>
                      <p className="text-[11px] text-red-600">Statutory + other</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-700">- {formatCurrency(breakdown.deductions.total.monthly)}</p>
                      <p className="text-[11px] text-red-600">{formatCurrency(breakdown.deductions.total.annual)} / yr</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="px-6 pb-6"
          >
            <div className="relative overflow-hidden rounded-2xl p-6 gradient-brand text-white">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2MkgyNHYtMmgxMnpNMzYgMjR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
                <div className="md:w-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 mb-3">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Net Salary</span>
                  </div>
                  <p className="text-white/70 text-sm mb-1">Amount credited to account</p>
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-extrabold tracking-tight">{formatCurrency(breakdown.net.monthly)}</p>
                    <div className="pb-2 flex items-center gap-1 text-white/70 text-xs mb-1.5">
                      <span>per month</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Annual: <span className="text-white font-semibold">{formatCurrency(breakdown.net.annual)}</span>
                  </p>
                </div>
                <div className="md:w-1/2 md:text-right space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur border border-white/20 text-sm">
                    <span>Calculation:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(breakdown.earnings.gross.monthly)}
                      <span className="mx-1 text-white/60">−</span>
                      {formatCurrency(breakdown.deductions.total.monthly)}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    <span className="font-bold">{formatCurrency(breakdown.net.monthly)}</span>
                  </div>
                  <p className="text-white/60 text-xs">
                    Payslip for {currentMonth} · {currentUser?.employeeId}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-odoo-gray-800 mb-4 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-indigo-600" />
              Savings Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-odoo-gray-600">EPF Contribution (Monthly)</span>
                  <span className="font-semibold text-odoo-gray-800">{formatCurrency(breakdown.deductions.epf.monthly)}</span>
                </div>
                <p className="text-xs text-odoo-gray-400">+ Employer match = {formatCurrency(breakdown.deductions.epf.monthly * 2)} total</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-odoo-gray-600">ESI Benefit (Monthly)</span>
                  <span className="font-semibold text-odoo-gray-800">{formatCurrency(breakdown.deductions.esi.monthly)}</span>
                </div>
                <p className="text-xs text-odoo-gray-400">Medical insurance coverage</p>
              </div>
              <div className="pt-3 border-t border-odoo-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-odoo-gray-700 font-medium">Total Monthly Savings</span>
                  <span className="font-bold text-primary-700">
                    {formatCurrency(breakdown.deductions.epf.monthly * 2 + breakdown.deductions.esi.monthly)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-odoo-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Past Payslips
              </h3>
              <span className="text-xs text-odoo-gray-400">Last 5 months</span>
            </div>
            <div className="space-y-2">
              {pastPayslips.map((ps, i) => (
                <motion.div
                  key={ps.month}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-odoo-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Receipt className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-odoo-gray-800 truncate">{ps.month}</p>
                    <p className="text-[11px] text-odoo-gray-400">{formatDate(ps.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-odoo-gray-800">{formatCurrency(ps.amount)}</p>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 justify-end">
                      <BadgeCheck className="w-3 h-3" />
                      {ps.status}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-odoo-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Payroll
