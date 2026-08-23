import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../components/common/Logo'
import { ArrowLeft } from 'lucide-react'

export function AuthLayout({ children }) {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/90 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* Left Side: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header & Logo */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  Invoice<span className="text-blue-600">Flow</span>
                </span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200/60"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
            </div>

            {/* Page Heading & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
                {isLogin
                  ? 'Welcome Back , Please enter Your details'
                  : 'Join InvoiceFlow , Please enter Your details'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="bg-slate-100/80 p-1.5 rounded-2xl grid grid-cols-2 gap-1 mb-6 border border-slate-200/50">
              <Link
                to="/login"
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-200 border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-200 border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Signup
              </Link>
            </div>

            {/* Main Form Content */}
            {children}
          </div>

          {/* Bottom Tagline Paragraph */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] leading-relaxed text-slate-400 text-center font-medium">
              Join the thousands of smart teams who trust us to manage their financial workflows. Log in to access your personalized dashboard, track invoice processing, and make informed financial decisions.
            </p>
          </div>
        </div>

        {/* Right Side: 3D Visual Illustration Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#e2f0fe] flex-col items-center justify-center p-8 overflow-hidden select-none">
          {/* Ambient Background Glows & Bars */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49%,rgba(255,255,255,0.4)_50%,transparent_51%)] [background-size:36px_100%] opacity-40"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/50 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>

          {/* 3D Vault Illustration Image */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xs transition-transform duration-500 hover:scale-105">
            <img
              src="/auth_3d_vault.png"
              alt="InvoiceFlow Financial Vault"
              className="w-full h-auto drop-shadow-xl object-contain max-h-[380px] rounded-2xl mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


