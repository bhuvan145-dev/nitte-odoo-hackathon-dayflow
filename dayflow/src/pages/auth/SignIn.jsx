import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const SignIn = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn(form.email, form.password)
      if (res.success) {
        navigate(res.user.role === 'HR' ? '/admin/dashboard' : '/dashboard')
      } else {
        setError(res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-primary-50 via-white to-brand-50">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col gap-6 p-8 rounded-3xl gradient-brand text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2MkgyNHYtMmgxMnpNMzYgMjR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">Dayflow</p>
                <p className="text-white/60 text-xs uppercase tracking-wider">HR Management Suite</p>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Welcome back 👋<br />
              Let's get things done.
            </h1>
            <p className="text-white/70 mb-10">
              Streamline your HR operations with modern attendance tracking, leave management, and payroll — all in one place.
            </p>
            <div className="space-y-3">
              {[
                { title: 'Employee Credentials', email: 'employee@dayflow.com', pwd: 'employee123' },
                { title: 'HR / Admin Credentials', email: 'admin@dayflow.com', pwd: 'admin123' }
              ].map((d, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-2">{d.title}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase">Email</p>
                      <p className="font-mono font-medium">{d.email}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase">Password</p>
                      <p className="font-mono font-medium">{d.pwd}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-8 lg:p-10"
        >
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-odoo-gray-800">Dayflow</p>
              <p className="text-[10px] text-odoo-gray-400 uppercase tracking-wider">HRMS</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-odoo-gray-800 mb-1">Sign in to your account</h2>
          <p className="text-odoo-gray-500 text-sm mb-7">Enter your credentials to access the portal</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="you@company.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-odoo-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-odoo-gray-400 hover:text-odoo-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-odoo-gray-200 text-primary-600 focus:ring-primary-500" />
                <span className="text-odoo-gray-600">Remember me</span>
              </label>
              <span className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-sm">
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-odoo-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignIn
