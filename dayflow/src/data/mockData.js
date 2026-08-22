import { generateId, generateAttendanceForMonth } from '../utils/helpers.js'
import { addDays, subDays, format } from 'date-fns'

export const defaultUsers = [
  {
    id: 'admin-1',
    employeeId: 'HR001',
    name: 'Priya Sharma',
    email: 'admin@dayflow.com',
    password: 'admin123',
    role: 'HR',
    phone: '+91 98765 43210',
    address: '123 Tech Park, Bangalore, Karnataka',
    dob: '1990-05-15',
    gender: 'Female',
    department: 'Human Resources',
    designation: 'HR Manager',
    joiningDate: '2020-01-15',
    salary: 850000,
    profilePicture: null,
    createdAt: '2024-01-01'
  },
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    name: 'Rahul Kumar',
    email: 'employee@dayflow.com',
    password: 'employee123',
    role: 'Employee',
    phone: '+91 98765 43211',
    address: '456 Green Avenue, Bangalore, Karnataka',
    dob: '1995-08-20',
    gender: 'Male',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    joiningDate: '2022-03-10',
    salary: 1200000,
    profilePicture: null,
    createdAt: '2024-01-01'
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    name: 'Anita Patel',
    email: 'anita@dayflow.com',
    password: 'employee123',
    role: 'Employee',
    phone: '+91 98765 43212',
    address: '789 Rose Street, Mumbai, Maharashtra',
    dob: '1992-11-05',
    gender: 'Female',
    department: 'Marketing',
    designation: 'Marketing Lead',
    joiningDate: '2021-06-20',
    salary: 950000,
    profilePicture: null,
    createdAt: '2024-01-01'
  },
  {
    id: 'emp-3',
    employeeId: 'EMP003',
    name: 'Vikram Singh',
    email: 'vikram@dayflow.com',
    password: 'employee123',
    role: 'Employee',
    phone: '+91 98765 43213',
    address: '321 Sunset Blvd, Pune, Maharashtra',
    dob: '1994-02-28',
    gender: 'Male',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    joiningDate: '2023-01-05',
    salary: 1100000,
    profilePicture: null,
    createdAt: '2024-01-01'
  },
  {
    id: 'emp-4',
    employeeId: 'EMP004',
    name: 'Sneha Reddy',
    email: 'sneha@dayflow.com',
    password: 'employee123',
    role: 'Employee',
    phone: '+91 98765 43214',
    address: '654 Lake View, Hyderabad, Telangana',
    dob: '1996-07-12',
    gender: 'Female',
    department: 'Finance',
    designation: 'Financial Analyst',
    joiningDate: '2022-09-15',
    salary: 800000,
    profilePicture: null,
    createdAt: '2024-01-01'
  },
  {
    id: 'emp-5',
    employeeId: 'EMP005',
    name: 'Arjun Mehta',
    email: 'arjun@dayflow.com',
    password: 'employee123',
    role: 'Employee',
    phone: '+91 98765 43215',
    address: '987 Park Lane, Delhi',
    dob: '1991-03-18',
    gender: 'Male',
    department: 'Sales',
    designation: 'Sales Manager',
    joiningDate: '2020-11-01',
    salary: 1050000,
    profilePicture: null,
    createdAt: '2024-01-01'
  }
]

export const generateDefaultLeaveRequests = (users) => {
  const requests = []
  const leaveTypes = ['Paid Leave', 'Sick Leave', 'Unpaid Leave']
  const statuses = ['Pending', 'Approved', 'Rejected']

  users.filter(u => u.role === 'Employee').forEach((emp, empIdx) => {
    for (let i = 0; i < 3; i++) {
      const startDate = addDays(subDays(new Date(), empIdx * 7), i * 3)
      const endDate = addDays(startDate, Math.floor(Math.random() * 3))
      requests.push({
        id: generateId(),
        employeeId: emp.id,
        employeeName: emp.name,
        leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
        remarks: [
          'Going on a family vacation',
          'Not feeling well, need rest',
          'Personal work at hometown',
          'Attending a family function',
          'Medical check-up scheduled'
        ][Math.floor(Math.random() * 5)],
        status: i === 0 ? 'Pending' : statuses[Math.floor(Math.random() * statuses.length)],
        adminComments: i !== 0 ? (statuses[Math.floor(Math.random() * statuses.length)] === 'Rejected' ? 'Please plan leaves in advance' : 'Approved, enjoy!') : null,
        createdAt: format(subDays(startDate, 2 + Math.floor(Math.random() * 5)), 'yyyy-MM-dd')
      })
    }
  })
  return requests
}

export const generateDefaultAttendance = (users) => {
  const records = []
  users.filter(u => u.role === 'Employee').forEach(emp => {
    records.push(...generateAttendanceForMonth(emp.id))
  })
  return records
}

export const salaryComponents = {
  basic: 0.4,
  hra: 0.2,
  specialAllowance: 0.15,
  conveyance: 0.05,
  medical: 0.05,
  epf: 0.12,
  esi: 0.0075,
  professionalTax: 2500
}

export const departments = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Design'
]

export const designations = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Engineer',
  'Engineering Manager',
  'HR Manager',
  'HR Executive',
  'Marketing Lead',
  'Sales Manager',
  'Sales Executive',
  'Financial Analyst',
  'Accountant',
  'Operations Manager',
  'UI/UX Designer',
  'Product Manager',
  'DevOps Engineer'
]

export const leaveTypes = ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Casual Leave']

export const leaveBalancesTemplate = {
  'Paid Leave': { total: 15, used: 0 },
  'Sick Leave': { total: 10, used: 0 },
  'Unpaid Leave': { total: 30, used: 0 },
  'Casual Leave': { total: 12, used: 0 }
}
