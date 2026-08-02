import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Zap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      email: 'finance@gmail.com',
      password: 'finance',
    },
  })

  const onSubmit = async (values) => {
    setErrorMessage('')
    setIsLoading(true)
    try {
      const res = await login({
        email: values.email,
        password: values.password,
      })

      if (res.success) {
        navigate('/app')
      } else {
        setErrorMessage(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (roleKey) => {
    setErrorMessage('')
    setIsLoading(true)
    const demoEmail = roleKey === 'manager' ? 'Manager@gmail.com' : 'finance@gmail.com'
    const demoPassword = roleKey === 'manager' ? 'Manager' : 'finance'

    setValue('email', demoEmail)
    setValue('password', demoPassword)

    try {
      const res = await login({
        email: demoEmail,
        password: demoPassword,
        role: roleKey,
        name: roleKey === 'manager' ? 'Finance Manager' : 'Finance Executive',
      })

      if (res.success) {
        navigate('/app')
      } else {
        setErrorMessage(res.error || 'Demo login failed')
      }
    } catch (err) {
      setErrorMessage('Demo login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-xl animate-in fade-in">
      {/* Return to Landing Page Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Return to Landing Page
        </Link>
        <span className="text-[10px] font-black uppercase text-slate-400">InvoiceFlow</span>
      </div>

      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-extrabold uppercase text-blue-700">
          <Zap className="h-3 w-3 fill-current" /> InvoiceFlow SaaS
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
        <p className="mt-0.5 text-xs text-slate-500 font-medium">Enter your credentials to access your dashboard</p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Demo Quick Access */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-1.5">
          ⚡ Quick Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin('finance')}
            className="rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50"
          >
            Finance Executive
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin('manager')}
            className="rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50"
          >
            Manager (Single)
          </button>
        </div>
      </div>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
        <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">or sign in with email</span>
      </div>

      {/* Form */}
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
          <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="email"
              autoComplete="email"
              required
              {...register('email')}
              className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
            <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">Forgot?</span>
          </div>
          <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Lock className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="password"
              autoComplete="current-password"
              required
              {...register('password')}
              className="ml-2.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 mt-1 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500 font-medium">
        Don’t have an account?{' '}
        <Link to="/signup" className="font-bold text-blue-600 hover:underline">
          Register Finance Executive
        </Link>
      </p>
    </div>
  )
}
