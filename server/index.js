import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'dayflow.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Employee',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  dob TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  department TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  joining_date TEXT NOT NULL,
  salary REAL NOT NULL DEFAULT 500000,
  profile_picture TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  days REAL NOT NULL,
  remarks TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_comments TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Present',
  check_in TEXT,
  check_out TEXT,
  hours_worked REAL DEFAULT 0,
  UNIQUE(employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES users(id)
);
`)

const countUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c
if (countUsers === 0) {
  console.log('Seeding default users...')
  const now = new Date().toISOString().split('T')[0]
  const insertUser = db.prepare(`INSERT INTO users
    (employee_id, name, email, password, role, phone, address, dob, gender, department, designation, joining_date, salary, created_at)
    VALUES (@employee_id, @name, @email, @password, @role, @phone, @address, @dob, @gender, @department, @designation, @joining_date, @salary, @created_at)`)

  const users = [
    {
      employee_id: 'HR001',
      name: 'Dayflow Admin',
      email: 'admin@dayflow.com',
      password: 'admin123',
      role: 'HR',
      phone: '+91 98765 43210',
      address: '123 Corporate Park, Bangalore',
      dob: '1990-05-15',
      gender: 'Female',
      department: 'Human Resources',
      designation: 'HR Executive',
      joining_date: now,
      salary: 900000,
      created_at: now,
    },
    {
      employee_id: 'EMP001',
      name: 'Rahul Sharma',
      email: 'employee@dayflow.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 99887 76655',
      address: '456 Tech Avenue, Bangalore',
      dob: '1995-11-22',
      gender: 'Male',
      department: 'Engineering',
      designation: 'Software Engineer',
      joining_date: now,
      salary: 600000,
      created_at: now,
    },
    {
      employee_id: 'EMP002',
      name: 'Priya Patel',
      email: 'priya@dayflow.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 91122 33445',
      address: '789 Green Street, Mumbai',
      dob: '1997-03-10',
      gender: 'Female',
      department: 'Engineering',
      designation: 'Frontend Developer',
      joining_date: now,
      salary: 550000,
      created_at: now,
    },
  ]

  const insertMany = db.transaction(rows => rows.forEach(r => insertUser.run(r)))
  insertMany(users)
  console.log('Seed users created:', users.map(u => u.email).join(', '))

  console.log('Seeding sample attendance & leave data...')
  const empIds = db.prepare('SELECT id, name FROM users WHERE role = ?').all('Employee')

  const insertAttendance = db.prepare(`INSERT INTO attendances
    (employee_id, date, status, check_in, check_out, hours_worked)
    VALUES (?, ?, ?, ?, ?, ?)`)

  const seedAttendance = db.transaction(() => {
    for (const emp of empIds) {
      for (let i = 1; i <= 20; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        if (d.getDay() === 0 || d.getDay() === 6) continue
        const dateStr = d.toISOString().split('T')[0]
        const roll = Math.random()
        if (roll < 0.85) {
          const inH = 9 + Math.floor(Math.random() * 1)
          const inM = Math.floor(Math.random() * 30)
          const outH = 18 + Math.floor(Math.random() * 1)
          const outM = Math.floor(Math.random() * 30)
          const ci = `${String(inH).padStart(2,'0')}:${String(inM).padStart(2,'0')}`
          const co = `${String(outH).padStart(2,'0')}:${String(outM).padStart(2,'0')}`
          const hrs = (outH + outM/60) - (inH + inM/60)
          insertAttendance.run(emp.id, dateStr, hrs < 4 ? 'Half-day' : 'Present', ci, co, parseFloat(hrs.toFixed(2)))
        } else if (roll < 0.95) {
          insertAttendance.run(emp.id, dateStr, 'Absent', null, null, 0)
        }
      }
    }
  })
  seedAttendance()

  const insertLeave = db.prepare(`INSERT INTO leave_requests
    (employee_id, employee_name, leave_type, start_date, end_date, days, remarks, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)

  const seedLeaves = db.transaction(() => {
    for (const emp of empIds) {
      const today = new Date()
      const past1 = new Date(today); past1.setDate(today.getDate() - 10)
      const past2 = new Date(today); past2.setDate(today.getDate() - 5)
      const future1 = new Date(today); future1.setDate(today.getDate() + 5)
      insertLeave.run(emp.id, emp.name, 'Casual Leave', past1.toISOString().split('T')[0], past1.toISOString().split('T')[0], 1, 'Personal work', 'Approved', today.toISOString().split('T')[0])
      insertLeave.run(emp.id, emp.name, 'Sick Leave', past2.toISOString().split('T')[0], past2.toISOString().split('T')[0], 1, 'Fever', 'Approved', today.toISOString().split('T')[0])
      insertLeave.run(emp.id, emp.name, 'Paid Leave', future1.toISOString().split('T')[0], (()=>{const x=new Date(future1);x.setDate(future1.getDate()+2);return x})().toISOString().split('T')[0], 3, 'Family vacation', 'Pending', today.toISOString().split('T')[0])
    }
  })
  seedLeaves()
  console.log('Sample data seeded.')
}

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

let sessionStore = new Map()

const userToFrontend = (u) => ({
  id: String(u.id),
  employeeId: u.employee_id,
  name: u.name,
  email: u.email,
  password: u.password,
  role: u.role,
  phone: u.phone || '',
  address: u.address || '',
  dob: u.dob || '',
  gender: u.gender || '',
  department: u.department || (u.role === 'HR' ? 'Human Resources' : 'Engineering'),
  designation: u.designation || (u.role === 'HR' ? 'HR Executive' : 'Software Engineer'),
  joiningDate: u.joining_date,
  salary: u.salary,
  profilePicture: u.profile_picture || null,
  createdAt: u.created_at,
})

const leaveToFrontend = (l) => ({
  id: String(l.id),
  employeeId: String(l.employee_id),
  employeeName: l.employee_name,
  leaveType: l.leave_type,
  startDate: l.start_date,
  endDate: l.end_date,
  days: l.days,
  remarks: l.remarks || '',
  status: l.status,
  adminComments: l.admin_comments,
  createdAt: l.created_at,
})

const attToFrontend = (a) => ({
  id: String(a.id),
  employeeId: String(a.employee_id),
  date: a.date,
  status: a.status,
  checkIn: a.check_in,
  checkOut: a.check_out,
  hoursWorked: a.hours_worked,
})

app.get('/api/health', (req, res) => res.json({ ok: true, db: DB_PATH, mode: 'sqlite' }))

app.get('/api/status', (req, res) => {
  const totals = {
    users: db.prepare('SELECT COUNT(*) c FROM users').get().c,
    leaves: db.prepare('SELECT COUNT(*) c FROM leave_requests').get().c,
    attendance: db.prepare('SELECT COUNT(*) c FROM attendances').get().c,
  }
  res.json({ ok: true, mode: 'sqlite', totals, version: '1.0.0' })
})

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.json({ success: false, error: 'Email and password required' })
  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email.toLowerCase())
  if (!user) return res.json({ success: false, error: 'Email not found' })
  if (user.password !== password) return res.json({ success: false, error: 'Incorrect password' })
  const token = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  sessionStore.set(token, { userId: user.id, email: user.email })
  res.cookie('dayflow_session', token, { httpOnly: false, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
  res.json({ success: true, user: userToFrontend(user), token })
})

app.post('/api/auth/signup', (req, res) => {
  const d = req.body || {}
  if (!d.email || !d.password || !d.name || !d.employeeId) {
    return res.json({ success: false, error: 'Name, Employee ID, Email and Password required' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email)=? OR UPPER(employee_id)=?').get(d.email.toLowerCase(), String(d.employeeId).toUpperCase())
  if (existing) return res.json({ success: false, error: existing.email?.toLowerCase() === d.email.toLowerCase() ? 'Email is already registered' : 'Employee ID already exists' })
  const role = d.role || 'Employee'
  const now = new Date().toISOString().split('T')[0]
  const info = db.prepare(`INSERT INTO users
    (employee_id, name, email, password, role, phone, address, dob, gender, department, designation, joining_date, salary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    String(d.employeeId).toUpperCase(), d.name, d.email, d.password, role,
    d.phone || '', '', '', '',
    role === 'HR' ? 'Human Resources' : 'Engineering',
    role === 'HR' ? 'HR Executive' : 'Software Engineer',
    now, 500000, now
  )
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  res.json({ success: true, user: userToFrontend(user) })
})

app.post('/api/auth/signout', (req, res) => {
  const token = req.headers['x-session-token'] || req.body?.token || (req.headers['authorization'] || '').replace('Bearer ', '')
  if (token) sessionStore.delete(token)
  res.clearCookie('dayflow_session')
  res.json({ success: true })
})

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(userToFrontend)
  res.json(users)
})

app.put('/api/users/:id/profile', (req, res) => {
  const id = req.params.id
  const d = req.body || {}
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id, 10) || 0)
  if (!u) return res.json(null)
  db.prepare(`UPDATE users SET name=?, phone=?, address=?, dob=?, gender=? WHERE id=?`).run(
    d.name ?? u.name, d.phone ?? u.phone, d.address ?? u.address, d.dob ?? u.dob, d.gender ?? u.gender, u.id
  )
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id)
  res.json(userToFrontend(updated))
})

app.put('/api/users/:id', (req, res) => {
  const id = req.params.id
  const d = req.body || {}
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id, 10) || 0)
  if (!u) return res.json(null)
  db.prepare(`UPDATE users SET name=?, employee_id=?, email=?, phone=?, role=?, salary=?, department=?, designation=? WHERE id=?`).run(
    d.name ?? u.name,
    d.employeeId ?? u.employee_id,
    d.email ?? u.email,
    d.phone ?? u.phone,
    d.role ?? u.role,
    d.salary ?? u.salary,
    d.department ?? u.department,
    d.designation ?? u.designation,
    u.id
  )
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id)
  res.json(userToFrontend(updated))
})

app.get('/api/leaves', (req, res) => {
  const rows = db.prepare('SELECT * FROM leave_requests ORDER BY created_at DESC, id DESC').all().map(leaveToFrontend)
  res.json(rows)
})

app.post('/api/leaves', (req, res) => {
  const d = req.body || {}
  const startDate = new Date(d.startDate)
  const endDate = new Date(d.endDate)
  const msPerDay = 1000 * 60 * 60 * 24
  let days = Math.max(1, Math.round(((endDate - startDate) / msPerDay) + 1))
  const today = new Date().toISOString().split('T')[0]
  const info = db.prepare(`INSERT INTO leave_requests
    (employee_id, employee_name, leave_type, start_date, end_date, days, remarks, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    parseInt(d.employeeId, 10) || 0, d.employeeName || '', d.leaveType || 'Paid Leave',
    d.startDate, d.endDate, days, d.remarks || '', 'Pending', today
  )
  const row = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(info.lastInsertRowid)
  res.json(leaveToFrontend(row))
})

app.put('/api/leaves/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10) || 0
  const { status, comment } = req.body || {}
  const l = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id)
  if (!l) return res.json(null)
  db.prepare('UPDATE leave_requests SET status = ?, admin_comments = COALESCE(?, admin_comments) WHERE id = ?').run(status, comment, id)
  const upd = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id)
  res.json(leaveToFrontend(upd))
})

app.get('/api/attendance', (req, res) => {
  const rows = db.prepare('SELECT * FROM attendances ORDER BY date DESC, id DESC').all().map(attToFrontend)
  res.json(rows)
})

app.post('/api/attendance/checkin', (req, res) => {
  const { employeeId, date, time } = req.body || {}
  const eid = parseInt(employeeId, 10) || 0
  const existing = db.prepare('SELECT * FROM attendances WHERE employee_id = ? AND date = ?').get(eid, date)
  if (existing) {
    db.prepare('UPDATE attendances SET check_in = ?, status = ? WHERE id = ?').run(time, 'Present', existing.id)
    const row = db.prepare('SELECT * FROM attendances WHERE id = ?').get(existing.id)
    return res.json(attToFrontend(row))
  }
  const info = db.prepare(`INSERT INTO attendances
    (employee_id, date, status, check_in, check_out, hours_worked)
    VALUES (?, ?, 'Present', ?, NULL, 0)`).run(eid, date, time)
  const row = db.prepare('SELECT * FROM attendances WHERE id = ?').get(info.lastInsertRowid)
  res.json(attToFrontend(row))
})

app.post('/api/attendance/checkout', (req, res) => {
  const { employeeId, date, time } = req.body || {}
  const eid = parseInt(employeeId, 10) || 0
  const rec = db.prepare('SELECT * FROM attendances WHERE employee_id = ? AND date = ?').get(eid, date)
  if (!rec) return res.json(null)
  const parseT = (s) => {
    if (!s) return 0
    const [h, m] = s.split(':').map(Number)
    return h + (m || 0) / 60
  }
  const hrs = Math.max(0, parseT(time) - parseT(rec.check_in))
  const hrsF = parseFloat(hrs.toFixed(2))
  db.prepare('UPDATE attendances SET check_out = ?, hours_worked = ?, status = ? WHERE id = ?').run(
    time, hrsF, hrsF < 4 ? 'Half-day' : 'Present', rec.id
  )
  const row = db.prepare('SELECT * FROM attendances WHERE id = ?').get(rec.id)
  res.json(attToFrontend(row))
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`\n🚀 Dayflow HRMS Backend (SQLite) running on http://localhost:${PORT}`)
  console.log(`   DB file: ${DB_PATH}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)
  console.log(`   Status:  http://localhost:${PORT}/api/status`)
  console.log(`\n   Default credentials:`)
  console.log(`   • Admin:    admin@dayflow.com  / admin123`)
  console.log(`   • Employee: employee@dayflow.com / employee123\n`)
})
