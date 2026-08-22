import { odooCommon, odooModels, callButtonMethod } from './odooClient.js'
import { defaultUsers, generateDefaultLeaveRequests, generateDefaultAttendance, leaveBalancesTemplate } from '../data/mockData.js'
import { generateId } from '../utils/helpers.js'

const AUTH_KEY = 'dayflow_auth'
const USERS_KEY = 'dayflow_users'
const LEAVES_KEY = 'dayflow_leaves'
const ATTENDANCE_KEY = 'dayflow_attendance'

const USE_ODOO_KEY = 'dayflow_use_odoo'

const useOdoo = () => localStorage.getItem(USE_ODOO_KEY) === 'true'

const ensureLocalSeed = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
  }
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  if (!localStorage.getItem(LEAVES_KEY)) {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(generateDefaultLeaveRequests(users)))
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(generateDefaultAttendance(users)))
  }
}

export const checkOdooAvailable = async () => {
  try {
    const v = await odooCommon.version()
    if (v && v.server_version) {
      localStorage.setItem(USE_ODOO_KEY, 'true')
      return { available: true, version: v.server_version }
    }
  } catch (_) { /* ignore */ }
  localStorage.setItem(USE_ODOO_KEY, 'false')
  return { available: false, version: null }
}

export const dataMode = () => useOdoo() ? 'odoo' : 'local'

const fromOdooLeaveType = { paid: 'Paid Leave', sick: 'Sick Leave', unpaid: 'Unpaid Leave', casual: 'Casual Leave' }
const toOdooLeaveType = { 'Paid Leave': 'paid', 'Sick Leave': 'sick', 'Unpaid Leave': 'unpaid', 'Casual Leave': 'casual' }
const fromOdooLeaveState = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
const fromOdooAttStatus = { present: 'Present', absent: 'Absent', half_day: 'Half-day', leave: 'Leave' }

const fmtDateTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : null
const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : null

const mapLeaveToFrontend = (l) => ({
  id: String(l.id),
  employeeId: String(l.employee_id?.[0] || l.employee_id || ''),
  employeeName: Array.isArray(l.employee_id) ? l.employee_id[1] : (l.employee_name || ''),
  leaveType: fromOdooLeaveType[l.leave_type] || l.leave_type || 'Paid Leave',
  startDate: l.date_from,
  endDate: l.date_to,
  days: l.number_of_days || 0,
  remarks: l.remarks || '',
  status: fromOdooLeaveState[l.state] || l.state || 'Pending',
  adminComments: l.admin_comment || null,
  createdAt: l.create_date ? l.create_date.split(' ')[0] : new Date().toISOString().split('T')[0],
  name: l.name
})

const mapAttendanceToFrontend = (a) => ({
  id: String(a.id),
  employeeId: String(a.employee_id?.[0] || a.employee_id || ''),
  date: a.date,
  status: fromOdooAttStatus[a.status] || a.status || 'Present',
  checkIn: a.check_in ? fmtDateTime(a.check_in) : null,
  checkOut: a.check_out ? fmtDateTime(a.check_out) : null,
  hoursWorked: a.worked_hours ? parseFloat(a.worked_hours.toFixed(2)) : 0,
})

const mapUserToFrontend = (u, extra = {}) => ({
  id: String(u.id),
  employeeId: u.dayflow_code || extra.employeeId || `EMP${String(u.id).padStart(3, '0')}`,
  name: u.name || extra.name || '',
  email: extra.email || u.work_email || u.login || '',
  password: extra.password || '',
  role: u.dayflow_role === 'admin' ? 'HR' : 'Employee',
  phone: u.work_phone || u.phone || '',
  address: u.address_home_id?.[1] || extra.address || '',
  dob: u.birthday ? fmtDate(u.birthday) : extra.dob || '',
  gender: u.gender === 'male' ? 'Male' : u.gender === 'female' ? 'Female' : extra.gender || '',
  department: u.department_id?.[1] || extra.department || (u.dayflow_role === 'admin' ? 'Human Resources' : 'Engineering'),
  designation: u.job_title || extra.designation || (u.dayflow_role === 'admin' ? 'HR Executive' : 'Software Engineer'),
  joiningDate: u.create_date ? u.create_date.split(' ')[0] : new Date().toISOString().split('T')[0],
  salary: u.dayflow_salary ? u.dayflow_salary * 12 : extra.salary || 500000,
  profilePicture: u.image_1920 ? `data:image/png;base64,${u.image_1920}` : null,
  createdAt: u.create_date ? u.create_date.split(' ')[0] : new Date().toISOString().split('T')[0],
  _odooUid: extra._odooUid || null,
})

/* ====================== AUTH ====================== */

export const apiSignIn = async (email, password) => {
  if (!useOdoo()) {
    ensureLocalSeed()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { success: false, error: 'Email not found' }
    if (user.password !== password) return { success: false, error: 'Incorrect password' }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    return { success: true, user }
  }
  try {
    const uid = await odooCommon.authenticate(email, password)
    if (!uid) return { success: false, error: 'Invalid credentials' }
    const models = odooModels(uid, password)
    const employees = await models.searchRead(
      'hr.employee',
      [['work_email', '=', email]],
      ['name', 'department_id', 'job_title', 'dayflow_role', 'dayflow_code', 'work_phone',
       'birthday', 'gender', 'create_date', 'dayflow_salary', 'image_1920', 'address_home_id', 'phone']
    )
    let emp = employees[0]
    if (!emp) {
      emp = (await models.searchRead(
        'hr.employee',
        [['user_id', '=', uid]],
        ['name', 'department_id', 'job_title', 'dayflow_role', 'dayflow_code', 'work_phone',
         'birthday', 'gender', 'create_date', 'dayflow_salary', 'image_1920', 'address_home_id', 'phone']
      ))[0]
    }
    if (!emp) {
      const users = await models.searchRead('res.users', [['id', '=', uid]], ['login', 'name', 'email'])
      emp = { id: 0, name: users[0]?.name || email, work_email: users[0]?.email || email }
    }
    const user = mapUserToFrontend(emp, { email, password, _odooUid: uid })
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, _odooUid: uid, _odooPwd: password }))
    return { success: true, user }
  } catch (err) {
    return { success: false, error: err.message || 'Login failed' }
  }
}

export const apiSignUp = async (data) => {
  if (!useOdoo()) {
    ensureLocalSeed()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email is already registered' }
    }
    if (users.find(u => u.employeeId.toUpperCase() === data.employeeId.toUpperCase())) {
      return { success: false, error: 'Employee ID already exists' }
    }
    const newUser = {
      id: `emp-${Date.now()}`,
      employeeId: data.employeeId.toUpperCase(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'Employee',
      phone: data.phone || '',
      address: '',
      dob: '',
      gender: '',
      department: data.role === 'HR' ? 'Human Resources' : 'Engineering',
      designation: data.role === 'HR' ? 'HR Executive' : 'Software Engineer',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 500000,
      profilePicture: null,
      createdAt: new Date().toISOString().split('T')[0],
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    return { success: true, user: newUser }
  }
  try {
    const adminUid = await odooCommon.authenticate('admin', 'admin')
    if (!adminUid) return { success: false, error: 'Cannot reach admin account for signup' }
    const am = odooModels(adminUid, 'admin')
    const existing = await am.searchRead('res.users', [['login', '=', data.email]], ['id'])
    if (existing.length) return { success: false, error: 'Email is already registered' }
    const userId = await am.create('res.users', {
      name: data.name,
      login: data.email,
      email: data.email,
      password: data.password,
    })
    const empId = await am.create('hr.employee', {
      name: data.name,
      user_id: userId,
      work_email: data.email,
      work_phone: data.phone || '',
      dayflow_code: data.employeeId.toUpperCase(),
      dayflow_role: data.role === 'HR' ? 'admin' : 'employee',
      job_title: data.role === 'HR' ? 'HR Executive' : 'Software Engineer',
    })
    return { success: true, user: mapUserToFrontend({ id: empId }, { employeeId: data.employeeId.toUpperCase(), name: data.name, email: data.email, password: data.password, role: data.role || 'Employee' }) }
  } catch (err) {
    return { success: false, error: err.message || 'Sign up failed' }
  }
}

export const apiGetCurrentUser = () => {
  const raw = localStorage.getItem(AUTH_KEY)
  return raw ? JSON.parse(raw) : null
}

export const apiSignOut = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const apiUpdateProfile = (updatedUser) => {
  if (!useOdoo()) {
    ensureLocalSeed()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]').map(u =>
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    )
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser))
    return users.find(u => u.id === updatedUser.id)
  }
  const cur = apiGetCurrentUser()
  if (cur && cur._odooUid) {
    const m = odooModels(cur._odooUid, cur._odooPwd)
    m.write('hr.employee', [parseInt(updatedUser.id, 10) || 0], {
      name: updatedUser.name,
      work_phone: updatedUser.phone,
    }).catch(() => {})
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser))
  return updatedUser
}

export const apiGetAllUsers = async () => {
  if (!useOdoo()) {
    ensureLocalSeed()
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  }
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return []
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const emps = await m.searchRead(
      'hr.employee',
      [],
      ['name', 'department_id', 'job_title', 'dayflow_role', 'dayflow_code', 'work_email', 'work_phone',
       'birthday', 'gender', 'create_date', 'dayflow_salary', 'dayflow_attendance_count', 'dayflow_leave_count']
    )
    return emps.map(e => mapUserToFrontend(e, { _odooUid: cur._odooUid }))
  } catch (_) { return [] }
}

export const apiUpdateEmployee = async (employeeId, updates) => {
  if (!useOdoo()) {
    ensureLocalSeed()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]').map(u =>
      u.id === employeeId ? { ...u, ...updates } : u
    )
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return users.find(u => u.id === employeeId)
  }
  const cur = apiGetCurrentUser()
  if (!cur || !cur._odooUid) return null
  try {
    const m = odooModels(cur._odooUid, cur._odooPwd)
    await m.write('hr.employee', [parseInt(employeeId, 10) || 0], {
      name: updates.name,
      dayflow_code: updates.employeeId,
      work_email: updates.email,
      work_phone: updates.phone,
      dayflow_role: updates.role === 'HR' ? 'admin' : 'employee',
      dayflow_salary: updates.salary ? updates.salary / 12 : undefined,
    })
    return await apiGetAllUsers().then(us => us.find(u => u.id === employeeId))
  } catch (_) { return null }
}

/* ====================== LEAVES ====================== */

export const apiGetLeaves = async () => {
  if (!useOdoo()) return JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]')
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return []
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const leaves = await m.searchRead(
      'dayflow.leave.request',
      [],
      ['name', 'employee_id', 'leave_type', 'date_from', 'date_to', 'number_of_days',
       'remarks', 'admin_comment', 'state', 'create_date'],
      0, 1000, 'create_date desc'
    )
    return leaves.map(mapLeaveToFrontend)
  } catch (_) { return JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]') }
}

export const apiApplyLeave = async (leaveData, employeeId, employeeName) => {
  const newLocal = {
    id: generateId(),
    employeeId,
    employeeName,
    status: 'Pending',
    adminComments: null,
    createdAt: new Date().toISOString().split('T')[0],
    ...leaveData,
  }
  if (!useOdoo()) {
    const all = [newLocal, ...JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]')]
    localStorage.setItem(LEAVES_KEY, JSON.stringify(all))
    return newLocal
  }
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return newLocal
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const eid = parseInt(employeeId, 10) || (await m.searchRead('hr.employee', [['dayflow_code', '=', employeeId]], ['id']))[0]?.id
    const id = await m.create('dayflow.leave.request', {
      employee_id: eid,
      leave_type: toOdooLeaveType[leaveData.leaveType] || 'paid',
      date_from: leaveData.startDate,
      date_to: leaveData.endDate,
      remarks: leaveData.remarks,
    })
    const created = (await m.searchRead('dayflow.leave.request', [['id', '=', id]],
      ['name', 'employee_id', 'leave_type', 'date_from', 'date_to', 'number_of_days', 'remarks', 'admin_comment', 'state', 'create_date']))[0]
    return mapLeaveToFrontend(created)
  } catch (_) { return newLocal }
}

export const apiUpdateLeaveStatus = async (leaveId, status, comment = null) => {
  if (!useOdoo()) {
    const all = JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]').map(l =>
      l.id === leaveId ? { ...l, status, adminComments: comment || l.adminComments } : l
    )
    localStorage.setItem(LEAVES_KEY, JSON.stringify(all))
    return all.find(l => l.id === leaveId)
  }
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return null
    const oid = parseInt(leaveId, 10) || 0
    if (status === 'Approved') {
      await callButtonMethod(cur._odooUid, cur._odooPwd, 'dayflow.leave.request', 'action_approve', [oid])
    } else if (status === 'Rejected') {
      await callButtonMethod(cur._odooUid, cur._odooPwd, 'dayflow.leave.request', 'action_reject', [oid])
    }
    if (comment) {
      const m = odooModels(cur._odooUid, cur._odooPwd)
      await m.write('dayflow.leave.request', [oid], { admin_comment: comment })
    }
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const upd = (await m.searchRead('dayflow.leave.request', [['id', '=', oid]],
      ['name', 'employee_id', 'leave_type', 'date_from', 'date_to', 'number_of_days', 'remarks', 'admin_comment', 'state', 'create_date']))[0]
    return mapLeaveToFrontend(upd)
  } catch (_) { return null }
}

export const apiGetLeaveBalance = async (employeeId) => {
  if (!useOdoo()) {
    const balances = JSON.parse(JSON.stringify(leaveBalancesTemplate))
    const approved = JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]').filter(
      l => l.employeeId === employeeId && l.status === 'Approved'
    )
    approved.forEach(l => { if (balances[l.leaveType]) balances[l.leaveType].used += l.days })
    return balances
  }
  try {
    const leaves = await apiGetLeaves()
    const balances = JSON.parse(JSON.stringify(leaveBalancesTemplate))
    leaves.filter(l => l.employeeId === employeeId && l.status === 'Approved')
      .forEach(l => { if (balances[l.leaveType]) balances[l.leaveType].used += l.days })
    return balances
  } catch (_) { return JSON.parse(JSON.stringify(leaveBalancesTemplate)) }
}

/* ====================== ATTENDANCE ====================== */

export const apiGetAttendance = async () => {
  if (!useOdoo()) return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]')
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return []
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const recs = await m.searchRead(
      'dayflow.attendance',
      [],
      ['employee_id', 'date', 'check_in', 'check_out', 'worked_hours', 'status'],
      0, 5000, 'check_in desc'
    )
    return recs.map(mapAttendanceToFrontend)
  } catch (_) { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]') }
}

const parseTime = (dateStr, timeStr) => {
  if (!timeStr) return null
  const [_, hhmm, ampm] = timeStr.match(/(\d+:\d+)\s*(AM|PM)/i) || []
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  let h24 = h
  if (ampm.toUpperCase() === 'PM' && h !== 12) h24 += 12
  if (ampm.toUpperCase() === 'AM' && h === 12) h24 = 0
  const d = new Date(`${dateStr}T00:00:00`)
  d.setHours(h24, m, 0, 0)
  return d.toISOString().replace('T', ' ')
}

export const apiCheckIn = async (employeeId, date, time) => {
  if (!useOdoo()) {
    const all = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]')
    const existing = all.find(a => a.employeeId === employeeId && a.date === date)
    if (existing) {
      existing.checkIn = time
      existing.status = 'Present'
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all))
      return existing
    }
    const nr = { id: generateId(), employeeId, date, status: 'Present', checkIn: time, checkOut: null, hoursWorked: 0 }
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([nr, ...all]))
    return nr
  }
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return null
    await callButtonMethod(cur._odooUid, cur._odooPwd, 'dayflow.attendance', 'dayflow_quick_check_in', [])
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const eid = parseInt(employeeId, 10) || (await m.searchRead('hr.employee', [['dayflow_code', '=', employeeId]], ['id']))[0]?.id || cur._odooUid
    const t = (await m.searchRead('dayflow.attendance',
      [['employee_id', '=', eid], ['date', '=', date]],
      ['employee_id', 'date', 'check_in', 'check_out', 'worked_hours', 'status'],
      0, 1, 'check_in desc'))[0]
    return t ? mapAttendanceToFrontend(t) : null
  } catch (err) { return null }
}

export const apiCheckOut = async (employeeId, date, time) => {
  if (!useOdoo()) {
    const all = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]')
    const rec = all.find(a => a.employeeId === employeeId && a.date === date)
    if (!rec) return null
    const ciD = new Date(`${rec.date} ${rec.checkIn}`)
    const coD = new Date(`${rec.date} ${time}`)
    const hrs = Math.max(0, (coD - ciD) / 36e5)
    rec.checkOut = time
    rec.hoursWorked = parseFloat(hrs.toFixed(2))
    rec.status = hrs < 4 ? 'Half-day' : 'Present'
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all))
    return rec
  }
  try {
    const cur = apiGetCurrentUser()
    if (!cur || !cur._odooUid) return null
    await callButtonMethod(cur._odooUid, cur._odooPwd, 'dayflow.attendance', 'dayflow_quick_check_out', [])
    const m = odooModels(cur._odooUid, cur._odooPwd)
    const eid = parseInt(employeeId, 10) || (await m.searchRead('hr.employee', [['dayflow_code', '=', employeeId]], ['id']))[0]?.id || cur._odooUid
    const t = (await m.searchRead('dayflow.attendance',
      [['employee_id', '=', eid], ['date', '=', date]],
      ['employee_id', 'date', 'check_in', 'check_out', 'worked_hours', 'status'],
      0, 1, 'check_in desc'))[0]
    return t ? mapAttendanceToFrontend(t) : null
  } catch (_) { return null }
}
