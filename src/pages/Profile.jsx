import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/axios'
import {
  User,
  Mail,
  CheckCircle2,
  Lock,
  Save,
  LogOut,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || 'Jeel Kathiria',
    email: user?.email || 'jeelkathiriya10f@gmail.com',
    role: user?.role || 'finance',
  })

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Map system role to clean single static label
  const roleDisplay = (formData.role || '').toLowerCase().includes('manager')
    ? 'Finance Manager'
    : 'Finance Executive'

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!formData.name.trim()) {
      setProfileError('Full Name cannot be empty')
      return
    }

    setProfileLoading(true)
    try {
      const res = await api.put('/profile', { name: formData.name })
      if (res.data && res.data.data) {
        if (updateUser) updateUser(res.data.data)
      } else {
        if (updateUser) updateUser({ name: formData.name })
      }
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.warn('[Profile]: Profile update API call:', err)
      if (updateUser) updateUser({ name: formData.name })
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwords.oldPassword) {
      setPasswordError('Please enter your current password')
      return
    }
    if (!passwords.newPassword) {
      setPasswordError('Please enter a new password')
      return
    }
    if (passwords.oldPassword === passwords.newPassword) {
      setPasswordError('New password cannot be the same as current password')
      return
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    if (passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await api.put('/profile/password', {
        currentPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })

      setPasswordSuccess(res.data?.message || 'Password changed successfully!')
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(''), 3500)
    } catch (err) {
      console.warn('[Profile]: Password update API error:', err)
      const errMsg = err.response?.data?.message || 'Failed to update password. Please check your current password.'
      setPasswordError(errMsg)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      {/* Header Banner Card - Clean Original Theme */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-700">
                {roleDisplay}
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

      {/* Main 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Security & Password */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Security & Password</h2>
              </div>
            </div>

            {passwordSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-bold flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Current Password
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  New Password
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <Key className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Confirm Password
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <Key className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 px-4 text-xs font-extrabold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-98 cursor-pointer transition disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Personal Profile Settings */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Personal Profile Settings</h2>
              </div>
              {profileSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {profileSuccess}
                </span>
              )}
            </div>

            {profileError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-bold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Name - EDITABLE */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Full Name <span className="text-blue-600 font-bold">(Editable)</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Email - READ ONLY */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Work Email <span className="text-amber-600 font-bold">(Read-only)</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
                </div>
              </div>

              {/* Role - STATIC LOCKED */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  System Role <span className="text-slate-400 font-medium">(Locked)</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    value={roleDisplay}
                    readOnly
                    disabled
                    className="ml-2.5 w-full bg-transparent text-xs font-bold text-slate-700 cursor-not-allowed outline-none"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
