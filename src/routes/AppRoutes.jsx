import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '../pages/Landing'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Signup'
import { Dashboard } from '../pages/Dashboard'
import { UploadInvoice } from '../pages/UploadInvoice'
import { InvoiceDetails } from '../pages/InvoiceDetails'
import { ApprovalQueue } from '../pages/ApprovalQueue'
import { AllInvoices } from '../pages/AllInvoices'
import { Profile } from '../pages/Profile'
import { Unauthorized } from '../pages/Unauthorized'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { useAuth } from '../context/AuthContext'

// Authentication Guard Component
function AuthProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Role Guard Component
function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth()
  const rawRole = (user?.role || 'finance').toLowerCase()

  const isAllowed = allowedRoles.some((allowed) => {
    const target = allowed.toLowerCase()
    if (target === 'finance' && rawRole.includes('finance')) return true
    if (target === 'manager' && rawRole.includes('manager')) return true
    return rawRole === target
  })

  if (!isAllowed) {
    return <Navigate to="/app/403" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
      
      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <AuthProtectedRoute>
            <MainLayout />
          </AuthProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Finance Restricted Route */}
        <Route
          path="upload"
          element={
            <RoleProtectedRoute allowedRoles={['finance']}>
              <UploadInvoice />
            </RoleProtectedRoute>
          }
        />
        
        {/* Manager Restricted Route */}
        <Route
          path="approval-queue"
          element={
            <RoleProtectedRoute allowedRoles={['manager']}>
              <ApprovalQueue />
            </RoleProtectedRoute>
          }
        />
        
        <Route path="invoices" element={<AllInvoices />} />
        <Route path="invoice/:invoiceId" element={<InvoiceDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="403" element={<Unauthorized />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
