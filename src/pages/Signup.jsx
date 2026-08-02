import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, User, Building, Zap, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Signup() {
  const { register, handleSubmit } = useForm()
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        companyName: values.companyName || 'Acme Corp',
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
    <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl backdrop-blur-xl animate-in fade-in">
      {/* Return to Landing Page Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Return to Landing Page
        </Link>
        <span className="text-[10px] font-black uppercase text-slate-400">InvoiceFlow</span>
      </div>

      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-extrabold uppercase text-blue-700">
          <Zap className="h-3 w-3 fill-current" /> Join InvoiceFlow
        </div>
        <h1 className="mt-2.5 text-2xl font-black text-slate-900 tracking-tight">Register Account</h1>
        <p className="mt-0.5 text-xs text-slate-500 font-medium">Create a Finance Executive workspace account</p>
      </div>

      {/* Info Badge */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] font-semibold text-blue-800">
        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
        <span>Public signup creates <strong>Finance Executive</strong> accounts. Single Manager account is fixed: <code>Manager@gmail.com</code></span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-bold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form className="mt-3 space-y-2.5" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name & Work Email */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
            <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                {...register('fullName')}
                className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Jane Finance"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Work Email</label>
            <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                {...register('email')}
                className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="finance2@company.com"
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
            <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="password"
                required
                {...register('password')}
                className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
            <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="password"
                required
                {...register('confirmPassword')}
                className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Role & Optional Company Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Role</label>
            <input
              type="text"
              readOnly
              value="Finance Executive"
              className="mt-0.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Name <span className="text-slate-400 font-normal">(Opt)</span></label>
            <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                {...register('companyName')}
                className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Acme Inc."
              />
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1 flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            {...register('terms')}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms" className="text-[11px] font-medium text-slate-600 cursor-pointer">
            I agree to the <span className="font-bold text-blue-600 hover:underline">Terms & Privacy Policy</span>.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 mt-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Bottom link */}
      <p className="mt-3.5 text-center text-xs text-slate-500 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
