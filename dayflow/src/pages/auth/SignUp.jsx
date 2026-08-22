import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  Eye,
  EyeOff,
  IdCard,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { validateEmail, validatePassword, validateEmployeeId } from '../../utils/helpers.js'

const SignUp = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    employeeId: '', name: '', email: '', phone: '', password: '', role: 'Employee'
  })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!validateEmployeeId(form.employeeId)) errs.employeeId = 'Min 3 alphanumeric chars'
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!validateEmail(form.email)) errs.email = 'Enter valid email'
    if (!validatePassword(form.password)) errs.password = 'Min 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const res = signUp(form)
      if (res.success) {
        setSuccess('Account created! Redirecting to sign in...')
        setTimeout(() => navigate('/signin'), 1500)
      } else {
        setErrors({ email: res.error })
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-primary-50 via-white to-brand-50">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 lg:p-10"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-odoo-gray-800">Create Account</p>
              <p className="text-[11px] text-odoo-gray-400 uppercase tracking-wider">Dayflow HRMS</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-odoo-gray-800 mb-1">Join the team</h2>
          <p className="text-odoo-gray-500 text-sm mb-7">Fill in your details to get started</p>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1"><IdCard className="w-3 h-3 text-odoo-gray-400" />Employee ID</label>
                <input value={form.employeeId} onChange={e => handleChange('employeeId', e.target.value)} placeholder="e.g. EMP006" className={errors.employeeId ? 'input-error' : 'input'} />
                {errors.employeeId && <p className="text-xs text-red-600 mt-1">{errors.employeeId}</p>}
              </div>
              <div>
                <label className="label flex items-center gap-1"><Briefcase className="w-3 h-3 text-odoo-gray-400" />Role</label>
                <select value={form.role} onChange={e => handleChange('role', e.target.value)} className="input">
                  <option value="Employee">Employee</option>
                  <option value="HR">HR / Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1"><User className="w-3 h-3 text-odoo-gray-400" />Full Name</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="John Doe" className={errors.name ? 'input-error' : 'input'} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1"><Mail className="w-3 h-3 text-odoo-gray-400" />Email</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@company.com" className={errors.email ? 'input-error' : 'input'} />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="label flex items-center gap-1"><Phone className="w-3 h-3 text-odoo-gray-400" />Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91..." className="input" />
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1"><Lock className="w-3 h-3 text-odoo-gray-400" />Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Min 6 characters" className={`${errors.password ? 'input-error' : 'input'} pr-10`} />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-odoo-gray-400 hover:text-odoo-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 mt-2 text-sm">
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-odoo-gray-500">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp
