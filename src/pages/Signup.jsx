import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, User, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Signup() {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Finance Executive',
    },
  })
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const nameVal = watch('fullName')
  const emailVal = watch('email')
  const passwordVal = watch('password')
  const confirmPasswordVal = watch('confirmPassword')

  const onSubmit = async (values) => {
    setErrorMessage('')

    if (values.password !== values.confirmPassword) {
      setErrorMessage('Passwords do not match!')
      return
    }

    if (values.password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const res = await signup({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: 'finance',
      })

      if (res.success) {
        navigate('/app')
      } else {
        setErrorMessage(res.error || 'Registration failed. An account with this email may already exist.')
      }
    } catch (err) {
      setErrorMessage('An account with this email already exists or signup failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-bold text-rose-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Name Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 flex items-center gap-3 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-slate-300">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Name
            </label>
            <input
              type="text"
              required
              {...register('fullName')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="Alex Morgan"
            />
          </div>
          {nameVal && nameVal.trim().length > 1 && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Email Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 flex items-center gap-3 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-slate-300">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              {...register('email')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="alex@company.com"
            />
          </div>
          {emailVal && emailVal.includes('@') && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Password Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 flex items-center gap-3 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-slate-300">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Password
            </label>
            <input
              type="password"
              required
              {...register('password')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="••••••••"
            />
          </div>
          {passwordVal && passwordVal.length >= 4 && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 flex items-center gap-3 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-slate-300">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              {...register('confirmPassword')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="••••••••"
            />
          </div>
          {confirmPasswordVal && confirmPasswordVal === passwordVal && passwordVal.length >= 4 && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Role Field (Only Finance) */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 flex items-center gap-3 cursor-not-allowed">
          <div className="w-9 h-9 rounded-xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Role
            </label>
            <input
              type="text"
              readOnly
              value="Finance Executive (Only Finance)"
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-700 cursor-not-allowed p-0 appearance-none"
            />
          </div>
        </div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>
    </div>
  )
}

