import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarClock,
  Wallet,
  Users,
  FileCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { cn } from '../../utils/cn.js'

const employeeNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leave', label: 'Leave', icon: CalendarClock },
  { to: '/payroll', label: 'Payroll', icon: Wallet }
]

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/leaves', label: 'Leave Approvals', icon: FileCheck },
  { to: '/admin/payroll', label: 'Payroll', icon: Wallet }
]

const AppLayout = ({ children }) => {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = currentUser?.role === 'HR' ? adminNav : employeeNav

  const handleSignOut = () => {
    signOut()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-odoo-gray-50 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-odoo-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-odoo-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-odoo-gray-800 leading-tight">Dayflow</p>
              <p className="text-[10px] text-odoo-gray-400 uppercase tracking-wider leading-tight">HRMS</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost !p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-odoo-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-brand-50 border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-odoo-gray-800 text-sm truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-odoo-gray-500 truncate">{currentUser?.designation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="chip bg-white/70 text-primary-700 text-[10px] font-semibold">
                {currentUser?.role}
              </span>
              <span className="chip bg-white/70 text-brand-700 text-[10px]">
                {currentUser?.employeeId}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider text-odoo-gray-400 px-3 py-2">
            {currentUser?.role === 'HR' ? 'Administration' : 'Workspace'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  'nav-link group',
                  isActive ? 'nav-link-active' : 'nav-link-inactive'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-primary-600')} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className={cn(
                  'w-3.5 h-3.5 transition-all',
                  isActive ? 'text-primary-500 opacity-100' : 'opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5'
                )} />
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-odoo-gray-100">
          <button
            onClick={handleSignOut}
            className="nav-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-odoo-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-ghost !p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-odoo-gray-400 uppercase tracking-wider">
                {currentUser?.role === 'HR' ? 'Admin Portal' : 'Employee Portal'}
              </p>
              <p className="text-sm font-semibold text-odoo-gray-700">
                {location.pathname.includes('dashboard') && 'Dashboard Overview'}
                {location.pathname.includes('profile') && 'My Profile'}
                {location.pathname.includes('attendance') && 'Attendance Records'}
                {location.pathname.includes('leave') && 'Leave Management'}
                {location.pathname.includes('payroll') && 'Payroll & Salary'}
                {location.pathname.includes('employees') && 'Employees'}
                {location.pathname.includes('leaves') && 'Leave Approvals'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost !p-2.5 relative">
              <Bell className="w-4 h-4 text-odoo-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
