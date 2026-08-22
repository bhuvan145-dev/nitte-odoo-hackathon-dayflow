import express from 'express'
import cors from 'cors'
import initSqlJs from 'sql.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'dayflow.db')

let db = null

const saveDB = () => {
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

const loadDB = async () => {
  const SQL = await initSqlJs({
    locateFile: (f) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', f)
  })
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH))
    console.log('Loaded existing DB:', DB_PATH)
  } else {
    db = new SQL.Database()
    console.log('Created new SQLite database')
  }
}

const esc = (v) => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

const q = (sql) => {
  const res = db.exec(sql)
  if (!res || !res.length) return []
  const { columns, values } = res[0]
  return values.map(row => {
    const o = {}
    columns.forEach((c, i) => { o[c] = row[i] })
    return o
  })
}

const exec = (sql) => { db.run(sql) }

const userToFE = (u) => ({
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

const leaveToFE = (l) => ({
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

const attToFE = (a) => ({
  id: String(a.id),
  employeeId: String(a.employee_id),
  date: a.date,
  status: a.status,
  checkIn: a.check_in,
  checkOut: a.check_out,
  hoursWorked: a.hours_worked,
})

const getLastId = () => q('SELECT last_insert_rowid() as id')[0].id

await loadDB()

exec(`CREATE TABLE IF NOT EXISTS users (
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
)`)

exec(`CREATE TABLE IF NOT EXISTS leave_requests (
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
  created_at TEXT NOT NULL
)`)

exec(`CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Present',
  check_in TEXT,
  check_out TEXT,
  hours_worked REAL DEFAULT 0,
  UNIQUE(employee_id, date)
)`)

const userCount = q('SELECT COUNT(*) as c FROM users')[0].c
if (userCount === 0) {
  console.log('Seeding default users + sample data...')
  const today = new Date().toISOString().split('T')[0]
  const seedUsers = [
    ['HR001','Dayflow Admin','admin@dayflow.com','admin123','HR','+91 98765 43210','123 Corporate Park, Bangalore','1990-05-15','Female','Human Resources','HR Executive',900000],
    ['EMP001','Rahul Sharma','employee@dayflow.com','employee123','Employee','+91 99887 76655','456 Tech Avenue, Bangalore','1995-11-22','Male','Engineering','Software Engineer',600000],
    ['EMP002','Priya Patel','priya@dayflow.com','employee123','Employee','+91 91122 33445','789 Green Street, Mumbai','1997-03-10','Female','Engineering','Frontend Developer',550000],
  ]
  for (const [eid,name,email,pwd,role,phone,addr,dob,gender,dept,desg,sal] of seedUsers) {
    exec(`INSERT INTO users (employee_id,name,email,password,role,phone,address,dob,gender,department,designation,joining_date,salary,created_at)
      VALUES (${esc(eid)},${esc(name)},${esc(email)},${esc(pwd)},${esc(role)},${esc(phone)},${esc(addr)},${esc(dob)},${esc(gender)},${esc(dept)},${esc(desg)},${esc(today)},${sal},${esc(today)})`)
  }

  const employees = q("SELECT id, name FROM users WHERE role = 'Employee'")
  for (const emp of employees) {
    for (let i = 1; i <= 20; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const ds = d.toISOString().split('T')[0]
      const roll = Math.random()
      if (roll < 0.85) {
        const ih = 9 + Math.floor(Math.random()*1)
        const im = Math.floor(Math.random()*30)
        const oh = 18 + Math.floor(Math.random()*1)
        const om = Math.floor(Math.random()*30)
        const ci = `${String(ih).padStart(2,'0')}:${String(im).padStart(2,'0')}`
        const co = `${String(oh).padStart(2,'0')}:${String(om).padStart(2,'0')}`
        const hrs = (oh + om/60) - (ih + im/60)
        exec(`INSERT INTO attendances (employee_id,date,status,check_in,check_out,hours_worked)
          VALUES (${emp.id},${esc(ds)},${esc(hrs<4?'Half-day':'Present')},${esc(ci)},${esc(co)},${parseFloat(hrs.toFixed(2))})`)
      } else if (roll < 0.95) {
        exec(`INSERT INTO attendances (employee_id,date,status,check_in,check_out,hours_worked)
          VALUES (${emp.id},${esc(ds)},'Absent',NULL,NULL,0)`)
      }
    }
  }

  for (const emp of employees) {
    const t = new Date()
    const p1 = new Date(t); p1.setDate(t.getDate()-10)
    const p2 = new Date(t); p2.setDate(t.getDate()-5)
    const f1 = new Date(t); f1.setDate(t.getDate()+5)
    const f2 = new Date(f1); f2.setDate(f1.getDate()+2)
    const p1s = p1.toISOString().split('T')[0]
    const p2s = p2.toISOString().split('T')[0]
    const f1s = f1.toISOString().split('T')[0]
    const f2s = f2.toISOString().split('T')[0]
    exec(`INSERT INTO leave_requests (employee_id,employee_name,leave_type,start_date,end_date,days,remarks,status,created_at)
      VALUES (${emp.id},${esc(emp.name)},'Casual Leave',${esc(p1s)},${esc(p1s)},1,'Personal work','Approved',${esc(today)})`)
    exec(`INSERT INTO leave_requests (employee_id,employee_name,leave_type,start_date,end_date,days,remarks,status,created_at)
      VALUES (${emp.id},${esc(emp.name)},'Sick Leave',${esc(p2s)},${esc(p2s)},1,'Fever','Approved',${esc(today)})`)
    exec(`INSERT INTO leave_requests (employee_id,employee_name,leave_type,start_date,end_date,days,remarks,status,created_at)
      VALUES (${emp.id},${esc(emp.name)},'Paid Leave',${esc(f1s)},${esc(f2s)},3,'Family vacation','Pending',${esc(today)})`)
  }
  saveDB()
  console.log('Seeding complete.')
}

setInterval(saveDB, 5000)
process.on('SIGTERM', () => { saveDB(); process.exit(0) })
process.on('SIGINT', () => { saveDB(); process.exit(0) })

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const sessions = new Map()

app.get('/api/health', (req, res) => res.json({ ok: true, db: DB_PATH, engine: 'sql.js-sqlite' }))

app.get('/api/status', (req, res) => {
  const uc = q('SELECT COUNT(*) c FROM users')[0].c
  const lc = q('SELECT COUNT(*) c FROM leave_requests')[0].c
  const ac = q('SELECT COUNT(*) c FROM attendances')[0].c
  res.json({ ok: true, mode: 'sqlite', totals: { users: uc, leaves: lc, attendance: ac }, version: '1.0.0' })
})

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.json({ success: false, error: 'Email and password required' })
  const users = q(`SELECT * FROM users WHERE LOWER(email) = ${esc(email.toLowerCase())} LIMIT 1`)
  const u = users[0]
  if (!u) return res.json({ success: false, error: 'Email not found' })
  if (u.password !== password) return res.json({ success: false, error: 'Incorrect password' })
  const tk = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  sessions.set(tk, { userId: u.id })
  res.cookie('dayflow_session', tk, { httpOnly: false, sameSite: 'lax', maxAge: 7*24*3600*1000 })
  res.json({ success: true, user: userToFE(u), token: tk })
})

app.post('/api/auth/signup', (req, res) => {
  const d = req.body || {}
  if (!d.email || !d.password || !d.name || !d.employeeId) {
    return res.json({ success: false, error: 'Name, Employee ID, Email and Password required' })
  }
  const ex = q(`SELECT id FROM users WHERE LOWER(email)=${esc(String(d.email).toLowerCase())} OR UPPER(employee_id)=${esc(String(d.employeeId).toUpperCase())}`)
  if (ex.length) return res.json({ success: false, error: (ex[0].email && String(ex[0].email).toLowerCase() === String(d.email).toLowerCase()) ? 'Email is already registered' : 'Employee ID already exists' })
  const role = d.role || 'Employee'
  const today = new Date().toISOString().split('T')[0]
  exec(`INSERT INTO users (employee_id,name,email,password,role,phone,address,dob,gender,department,designation,joining_date,salary,created_at)
    VALUES (${esc(String(d.employeeId).toUpperCase())},${esc(d.name)},${esc(d.email)},${esc(d.password)},${esc(role)},${esc(d.phone||'')},'','','',${esc(role==='HR'?'Human Resources':'Engineering')},${esc(role==='HR'?'HR Executive':'Software Engineer')},${esc(today)},500000,${esc(today)})`)
  saveDB()
  const id = getLastId()
  const u = q(`SELECT * FROM users WHERE id = ${id}`)[0]
  res.json({ success: true, user: userToFE(u) })
})

app.post('/api/auth/signout', (req, res) => {
  const tk = req.headers['x-session-token'] || req.body?.token
  if (tk) sessions.delete(tk)
  res.clearCookie('dayflow_session')
  res.json({ success: true })
})

app.get('/api/users', (req, res) => {
  res.json(q('SELECT * FROM users ORDER BY created_at DESC, id DESC').map(userToFE))
})

app.put('/api/users/:id/profile', (req, res) => {
  const id = parseInt(req.params.id, 10) || 0
  const d = req.body || {}
  const cur = q(`SELECT * FROM users WHERE id = ${id}`)[0]
  if (!cur) return res.json(null)
  exec(`UPDATE users SET name=${esc(d.name??cur.name)}, phone=${esc(d.phone??cur.phone)}, address=${esc(d.address??cur.address)}, dob=${esc(d.dob??cur.dob)}, gender=${esc(d.gender??cur.gender)} WHERE id=${id}`)
  saveDB()
  res.json(userToFE(q(`SELECT * FROM users WHERE id = ${id}`)[0]))
})

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10) || 0
  const d = req.body || {}
  const cur = q(`SELECT * FROM users WHERE id = ${id}`)[0]
  if (!cur) return res.json(null)
  exec(`UPDATE users SET name=${esc(d.name??cur.name)}, employee_id=${esc(d.employeeId??cur.employee_id)}, email=${esc(d.email??cur.email)}, phone=${esc(d.phone??cur.phone)}, role=${esc(d.role??cur.role)}, salary=${d.salary??cur.salary}, department=${esc(d.department??cur.department)}, designation=${esc(d.designation??cur.designation)} WHERE id=${id}`)
  saveDB()
  res.json(userToFE(q(`SELECT * FROM users WHERE id = ${id}`)[0]))
})

app.get('/api/leaves', (req, res) => {
  res.json(q('SELECT * FROM leave_requests ORDER BY created_at DESC, id DESC').map(leaveToFE))
})

app.post('/api/leaves', (req, res) => {
  const d = req.body || {}
  const start = new Date(d.startDate)
  const end = new Date(d.endDate)
  const msPerDay = 86400000
  const days = Math.max(1, Math.round(((end - start) / msPerDay) + 1))
  const today = new Date().toISOString().split('T')[0]
  const eid = parseInt(d.employeeId, 10) || 0
  exec(`INSERT INTO leave_requests (employee_id,employee_name,leave_type,start_date,end_date,days,remarks,status,created_at)
    VALUES (${eid},${esc(d.employeeName||'')},${esc(d.leaveType||'Paid Leave')},${esc(d.startDate)},${esc(d.endDate)},${days},${esc(d.remarks||'')},'Pending',${esc(today)})`)
  saveDB()
  const id = getLastId()
  res.json(leaveToFE(q(`SELECT * FROM leave_requests WHERE id = ${id}`)[0]))
})

app.put('/api/leaves/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10) || 0
  const { status, comment } = req.body || {}
  const l = q(`SELECT * FROM leave_requests WHERE id = ${id}`)[0]
  if (!l) return res.json(null)
  if (comment !== undefined && comment !== null) {
    exec(`UPDATE leave_requests SET status=${esc(status)}, admin_comments=${esc(comment||l.admin_comments)} WHERE id=${id}`)
  } else {
    exec(`UPDATE leave_requests SET status=${esc(status)} WHERE id=${id}`)
  }
  saveDB()
  res.json(leaveToFE(q(`SELECT * FROM leave_requests WHERE id = ${id}`)[0]))
})

app.get('/api/attendance', (req, res) => {
  res.json(q('SELECT * FROM attendances ORDER BY date DESC, id DESC').map(attToFE))
})

app.post('/api/attendance/checkin', (req, res) => {
  const { employeeId, date, time } = req.body || {}
  const eid = parseInt(employeeId, 10) || 0
  const existing = q(`SELECT * FROM attendances WHERE employee_id=${eid} AND date=${esc(date)}`)[0]
  if (existing) {
    exec(`UPDATE attendances SET check_in=${esc(time)}, status='Present' WHERE id=${existing.id}`)
    saveDB()
    return res.json(attToFE(q(`SELECT * FROM attendances WHERE id=${existing.id}`)[0]))
  }
  exec(`INSERT INTO attendances (employee_id,date,status,check_in,check_out,hours_worked) VALUES (${eid},${esc(date)},'Present',${esc(time)},NULL,0)`)
  saveDB()
  const id = getLastId()
  res.json(attToFE(q(`SELECT * FROM attendances WHERE id=${id}`)[0]))
})

app.post('/api/attendance/checkout', (req, res) => {
  const { employeeId, date, time } = req.body || {}
  const eid = parseInt(employeeId, 10) || 0
  const r = q(`SELECT * FROM attendances WHERE employee_id=${eid} AND date=${esc(date)}`)[0]
  if (!r) return res.json(null)
  const parseT = s => { if (!s) return 0; const [h,m] = s.split(':').map(Number); return h + (m||0)/60 }
  const hrsF = parseFloat(Math.max(0, parseT(time) - parseT(r.check_in)).toFixed(2))
  exec(`UPDATE attendances SET check_out=${esc(time)}, hours_worked=${hrsF}, status=${esc(hrsF<4?'Half-day':'Present')} WHERE id=${r.id}`)
  saveDB()
  res.json(attToFE(q(`SELECT * FROM attendances WHERE id=${r.id}`)[0]))
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  const info = q('SELECT COUNT(*) u FROM users')[0].u
  console.log(`\n🚀 Dayflow HRMS Backend (SQLite/sql.js) running on http://localhost:${PORT}`)
  console.log(`   DB file : ${DB_PATH}`)
  console.log(`   Users   : ${info}`)
  console.log(`   Health  : http://localhost:${PORT}/api/health`)
  console.log(`   Status  : http://localhost:${PORT}/api/status`)
  console.log(`\n   Default credentials:`)
  console.log(`   • Admin    → admin@dayflow.com / admin123`)
  console.log(`   • Employee → employee@dayflow.com / employee123`)
  console.log(`   • Employee → priya@dayflow.com / employee123\n`)
})
