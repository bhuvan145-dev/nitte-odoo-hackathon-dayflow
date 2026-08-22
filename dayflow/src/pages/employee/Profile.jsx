import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Briefcase,
  Wallet,
  FileText,
  Pencil,
  X,
  Save,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  UserCircle,
  IdCard,
  GraduationCap,
  DollarSign,
  Clock,
  FileCheck,
  Upload,
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../../utils/helpers.js'
import { cn } from '../../utils/cn.js'

const tabs = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'job', label: 'Job Details', icon: Briefcase },
  { id: 'salary', label: 'Salary Structure', icon: Wallet },
  { id: 'documents', label: 'Documents', icon: FileText }
]

const editableFields = ['phone', 'address', 'profilePicture']

const Profile = () => {
  const { currentUser, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ ...currentUser })
  const fileInputRef = useRef(null)

  const handleEditToggle = () => {
    if (editing) {
      setFormData({ ...currentUser })
    }
    setEditing(!editing)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      const updates = {}
      editableFields.forEach(f => { updates[f] = formData[f] })
      updateProfile(updates)
      setEditing(false)
      setSaving(false)
    }, 500)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      handleChange('profilePicture', ev.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const salary = currentUser?.salary || 500000
  const monthlyCTC = salary / 12
  const basic = salary * 0.4
  const hra = salary * 0.2
  const conveyance = salary * 0.05
  const medical = salary * 0.05
  const special = salary * 0.15
  const epf = basic * 0.12
  const esi = salary * 0.0075
  const professionalTax = 2500
  const grossAnnual = basic + hra + conveyance + medical + special
  const totalDeductionsAnnual = (epf + esi) * 12 + professionalTax
  const netAnnual = grossAnnual - totalDeductionsAnnual

  const isEditable = (field) => editing && editableFields.includes(field)

  const FieldRow = ({ label, value, field, type = 'text', icon: Icon, multiline = false }) => {
    const disabled = !isEditable(field)
    return (
      <div>
        <label className="label flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-odoo-gray-400" />}
          {label}
          {editing && editableFields.includes(field) && (
            <span className="text-xs text-primary-600 font-normal ml-auto">editable</span>
          )}
        </label>
        {multiline ? (
          <textarea
            value={formData[field] || value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={!disabled === false ? false : !editableFields.includes(field)}
            rows={3}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm transition-all resize-none',
              isEditable(field)
                ? 'input focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                : 'bg-odoo-gray-50 border-odoo-gray-100 text-odoo-gray-700 cursor-not-allowed'
            )}
          />
        ) : (
          <input
            type={type}
            value={formData[field] || value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={!editableFields.includes(field) || !editing}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm transition-all',
              isEditable(field)
                ? 'input focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                : 'bg-odoo-gray-50 border-odoo-gray-100 text-odoo-gray-700 cursor-not-allowed'
            )}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="h-36 gradient-brand relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-14">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-card overflow-hidden">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-3xl font-bold">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>
              {editing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-xl bg-white shadow-md border border-odoo-gray-100 flex items-center justify-center text-odoo-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-odoo-gray-800">{currentUser?.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-odoo-gray-500">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{currentUser?.designation}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{currentUser?.department}</span>
                <span className="flex items-center gap-1"><IdCard className="w-3.5 h-3.5" />{currentUser?.employeeId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="btn-primary">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleEditToggle} className="btn-secondary">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleEditToggle} className="btn-primary">
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-odoo-gray-100">
          <div className="px-6 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                      isActive
                        ? 'border-primary-600 text-primary-700'
                        : 'border-transparent text-odoo-gray-500 hover:text-odoo-gray-700 hover:bg-odoo-gray-50/50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive && 'text-primary-600')} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <FieldRow label="Full Name" value={currentUser?.name} field="name" icon={UserCircle} />
                <FieldRow label="Email" value={currentUser?.email} field="email" type="email" icon={Mail} />
                <FieldRow label="Phone" value={currentUser?.phone} field="phone" icon={Phone} />
                <FieldRow label="Date of Birth" value={currentUser?.dob ? formatDate(currentUser.dob) : ''} field="dob" type="date" icon={Calendar} />
                <FieldRow label="Gender" value={currentUser?.gender} field="gender" icon={UserCircle} />
                <div className="md:col-span-2">
                  <FieldRow label="Address" value={currentUser?.address} field="address" icon={MapPin} multiline />
                </div>
              </motion.div>
            )}

            {activeTab === 'job' && (
              <motion.div
                key="job"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <FieldRow label="Employee ID" value={currentUser?.employeeId} field="employeeId" icon={IdCard} />
                <FieldRow label="Designation" value={currentUser?.designation} field="designation" icon={Briefcase} />
                <FieldRow label="Department" value={currentUser?.department} field="department" icon={Building2} />
                <FieldRow label="Joining Date" value={currentUser?.joiningDate ? formatDate(currentUser.joiningDate) : ''} field="joiningDate" icon={Calendar} />
                <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-brand-50 border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-odoo-gray-800">Employment Status</p>
                      <p className="text-xs text-odoo-gray-500">Active · Full-time</p>
                    </div>
                    <span className="ml-auto badge badge-success">
                      <Clock className="w-3 h-3" /> Since {currentUser?.joiningDate ? formatDate(currentUser.joiningDate, 'MMM yyyy') : ''}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'salary' && (
              <motion.div
                key="salary"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2 card !shadow-none !border-odoo-gray-100">
                  <div className="p-5 border-b border-odoo-gray-100 bg-gradient-to-r from-primary-600/5 to-brand-500/5">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-odoo-gray-800">Earnings (Annual)</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { label: 'Basic (40%)', amount: basic },
                      { label: 'HRA (20%)', amount: hra },
                      { label: 'Conveyance Allowance (5%)', amount: conveyance },
                      { label: 'Medical Allowance (5%)', amount: medical },
                      { label: 'Special Allowance (15%)', amount: special }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1.5">
                        <span className="text-odoo-gray-600">{row.label}</span>
                        <span className="font-medium text-odoo-gray-800">{formatCurrency(row.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-odoo-gray-100 pt-3 mt-3 flex items-center justify-between">
                      <span className="font-semibold text-odoo-gray-800">Gross Earnings</span>
                      <span className="font-bold text-odoo-gray-900">{formatCurrency(grossAnnual)}</span>
                    </div>
                  </div>
                </div>

                <div className="card !shadow-none !border-odoo-gray-100">
                  <div className="p-5 border-b border-odoo-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <h3 className="font-semibold text-odoo-gray-800">Deductions (Annual)</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-odoo-gray-600">EPF (12% of Basic)</span>
                      <span className="font-medium text-odoo-gray-800">{formatCurrency(epf * 12)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-odoo-gray-600">ESI (0.75%)</span>
                      <span className="font-medium text-odoo-gray-800">{formatCurrency(esi * 12)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-odoo-gray-600">Professional Tax</span>
                      <span className="font-medium text-odoo-gray-800">{formatCurrency(professionalTax)}</span>
                    </div>
                    <div className="border-t border-odoo-gray-100 pt-3 mt-3 flex items-center justify-between">
                      <span className="font-semibold text-odoo-gray-800">Total Deductions</span>
                      <span className="font-bold text-red-600">- {formatCurrency(totalDeductionsAnnual)}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 p-6 rounded-xl gradient-brand text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Annual CTC</p>
                      <p className="text-2xl font-bold">{formatCurrency(salary)}</p>
                      <p className="text-white/60 text-sm mt-1">Monthly: {formatCurrency(monthlyCTC)}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Gross Annual</p>
                      <p className="text-2xl font-bold">{formatCurrency(grossAnnual)}</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Net Annual Take-home</p>
                      <p className="text-3xl font-bold">{formatCurrency(netAnnual)}</p>
                      <p className="text-white/60 text-sm mt-1">Monthly: {formatCurrency(netAnnual / 12)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-odoo-gray-500">Manage your employment documents</p>
                  <button className="btn-secondary">
                    <Upload className="w-4 h-4" /> Upload Document
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Offer Letter', type: 'PDF', date: currentUser?.joiningDate, status: 'Verified' },
                    { name: 'Experience Certificate', type: 'PDF', date: currentUser?.joiningDate, status: 'Verified' },
                    { name: 'Aadhaar Card', type: 'PDF', date: currentUser?.createdAt, status: 'Verified' },
                    { name: 'PAN Card', type: 'PDF', date: currentUser?.createdAt, status: 'Verified' },
                    { name: 'Educational Certificates', type: 'ZIP', date: currentUser?.createdAt, status: 'Verified' },
                    { name: 'Bank Details', type: 'PDF', date: currentUser?.createdAt, status: 'Pending' }
                  ].map((doc, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl border border-odoo-gray-100 hover:border-odoo-gray-200 bg-white transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <FileCheck className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-odoo-gray-800 truncate">{doc.name}</p>
                            <span className="chip bg-odoo-gray-100 text-odoo-gray-600">{doc.type}</span>
                          </div>
                          <p className="text-xs text-odoo-gray-500 mt-0.5">
                            Uploaded on {doc.date ? formatDate(doc.date) : '--'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-odoo-gray-50">
                        <span className={cn('badge', doc.status === 'Verified' ? 'badge-success' : 'badge-warning')}>
                          {doc.status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                          {doc.status}
                        </span>
                        <div className="flex gap-1">
                          <button className="btn-ghost !p-2"><Download className="w-4 h-4" /></button>
                          <button className="btn-ghost !p-2 text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile
