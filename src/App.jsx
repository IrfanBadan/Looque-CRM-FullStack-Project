import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminRoute } from './guards/AdminRoute'
import { EmployeeRoute } from './guards/EmployeeRoute'
import { PublicRoute } from './guards/PublicRoute'
import Login from './pages/auth/Login'
import AdminLayout from './components/Layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employees'
import AttendanceReports from './pages/admin/AttendanceReports'
import SalaryManagement from './pages/admin/SalaryManagement'
import Customers from './pages/admin/Customers'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import Inventory from './pages/admin/Inventory'
import Analytics from './pages/admin/Analytics'
import Marketing from './pages/admin/Marketing'
import Support from './pages/admin/Support'
import Settings from './pages/admin/Settings'
import Attendance from './pages/employee/Attendance'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <EmployeeRoute>
                <Attendance />
              </EmployeeRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Employees />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/attendance-reports"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AttendanceReports />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/salary"
            element={
              <AdminRoute>
                <AdminLayout>
                  <SalaryManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Customers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/products"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Inventory />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Marketing />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/support"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Support />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
