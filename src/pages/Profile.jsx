import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  Building,
  Save,
  LogOut,
} from 'lucide-react'

export function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || 'Jeel Kathiria',
    email: user?.email || 'jeelkathiriya10f@gmail.com',
    role: user?.role || 'finance',
    department: 'Finance & Operations',
    companyName: 'Acme Corp Pvt Ltd',
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    if (updateUser) {
      updateUser({
        name: formData.name,
        email: formData.email,
        role: formData.role.toLowerCase(),
      })
    }
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      {/* Header Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-md">
            {formData.name ? formData.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-700">
                {formData.role}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active Account
              </span>
            </div>
            <h1 className="mt-1 text-xl font-black text-slate-900 tracking-tight">{formData.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{formData.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Account & Company Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Personal & Organization Profile</h2>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> Profile updated successfully!
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Work Email</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Role</label>
              <select
                value={formData.role ? formData.role.toLowerCase() : 'finance'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition cursor-pointer capitalize"
              >
                <option value="finance">Finance Executive</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Company Name</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                <Building className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & API Keys */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Security & Integration Access</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Two-Factor Auth (2FA)</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold">Active</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Protected via Authenticator App</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">API Integration Token</span>
                <span className="text-[10px] font-mono font-bold text-blue-600">if_live_9941...</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Rest API access for Gemini extraction pipeline</p>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  )
}
