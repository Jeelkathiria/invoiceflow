import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Unauthorized() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRole = (user?.role || 'finance').toLowerCase()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 shadow-sm border border-rose-100 mb-5">
        <ShieldAlert className="h-10 w-10 stroke-[2]" />
      </div>

      <span className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-black text-rose-700 uppercase tracking-widest">
        403 Unauthorized Access
      </span>

      <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
        Access Denied to This Section
      </h1>

      <p className="mt-2 max-w-md text-xs text-slate-500 font-medium leading-relaxed">
        Your current role (<span className="font-bold text-blue-600 capitalize">{userRole === 'manager' ? 'Finance Manager' : 'Finance Executive'}</span>) does not have permission to view this page according to InvoiceFlow Role-Based Access Control rules.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Home className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  )
}
