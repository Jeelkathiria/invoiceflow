import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  const handleManagerDemoLogin = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)
    const demoEmail = 'Manager@gmail.com'
    const demoPassword = 'Manager'

    setValue('email', demoEmail)
    setValue('password', demoPassword)

    try {
      const res = await login({
        email: demoEmail,
        password: demoPassword,
        role: 'manager',
        name: 'Finance Manager',
      })

      if (res.success) {
        navigate('/app', { replace: true })
      } else {
        setErrorMessage(res.error || 'Demo login failed')
      }
    } catch (err) {
      setErrorMessage('Demo login failed')
    } finally {
      setIsLoading(false)
    }
  }, [login, navigate, setValue])

  useEffect(() => {
    const auto = searchParams.get('auto')
    const role = searchParams.get('role')
    if (auto === 'manager' || role === 'manager' || auto === 'true') {
      handleManagerDemoLogin()
    }
  }, [searchParams, handleManagerDemoLogin])

  const onSubmit = async (values) => {
    setErrorMessage('')
    setIsLoading(true)
    try {
      const res = await login({
        email: values.email,
        password: values.password,
      })

      if (res.success) {
        navigate('/app', { replace: true })
      } else {
        setErrorMessage(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-bold text-rose-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Demo Credentials - Manager Only */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Quick Demo Credentials</p>
            <p className="text-[10px] text-slate-500 font-medium">Manager Only (`Manager@gmail.com`)</p>
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleManagerDemoLogin}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-blue-500/20 disabled:opacity-50 shrink-0"
        >
          Login as Manager
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Email Address Field */}
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
              autoComplete="email"
              required
              {...register('email')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="Manager@gmail.com"
            />
          </div>
          {emailValue && emailValue.includes('@') && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Password Field */}
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 flex items-center gap-3 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-slate-300">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                Password
              </label>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              required
              {...register('password')}
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-300 p-0 appearance-none"
              placeholder="••••••••"
            />
          </div>

          {passwordValue && passwordValue.length > 0 && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </form>
    </div>
  )
}

