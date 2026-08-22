import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { AnimatePresence, motion } from 'framer-motion'

import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import EmployeeDashboard from './pages/employee/Dashboard.jsx'
import EmployeeProfile from './pages/employee/Profile.jsx'
import EmployeeAttendance from './pages/employee/Attendance.jsx'
import EmployeeLeave from './pages/employee/Leave.jsx'
import EmployeePayroll from './pages/employee/Payroll.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminEmployees from './pages/admin/Employees.jsx'
import AdminAttendance from './pages/admin/Attendance.jsx'
import AdminLeaveApprovals from './pages/admin/LeaveApprovals.jsx'
import AdminPayroll from './pages/admin/Payroll.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import LoadingScreen from './components/common/LoadingScreen.jsx'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!currentUser) return <Navigate to="/signin" replace />
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to={currentUser.role === 'HR' ? '/admin/dashboard' : '/dashboard'} replace />
  }
  return children
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const wrapPage = (Component) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <Component />
    </motion.div>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/signin" element={wrapPage(SignIn)} />
          <Route path="/signup" element={wrapPage(SignUp)} />

          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="Employee">
              <AppLayout>{wrapPage(EmployeeDashboard)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="Employee">
              <AppLayout>{wrapPage(EmployeeProfile)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute requiredRole="Employee">
              <AppLayout>{wrapPage(EmployeeAttendance)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/leave" element={
            <ProtectedRoute requiredRole="Employee">
              <AppLayout>{wrapPage(EmployeeLeave)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/payroll" element={
            <ProtectedRoute requiredRole="Employee">
              <AppLayout>{wrapPage(EmployeePayroll)}</AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="HR">
              <AppLayout>{wrapPage(AdminDashboard)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute requiredRole="HR">
              <AppLayout>{wrapPage(AdminEmployees)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute requiredRole="HR">
              <AppLayout>{wrapPage(AdminAttendance)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/leaves" element={
            <ProtectedRoute requiredRole="HR">
              <AppLayout>{wrapPage(AdminLeaveApprovals)}</AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payroll" element={
            <ProtectedRoute requiredRole="HR">
              <AppLayout>{wrapPage(AdminPayroll)}</AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
