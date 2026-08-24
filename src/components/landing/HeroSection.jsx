import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, ShieldCheck, FileCheck, Zap, Bot, Layers } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative mx-auto flex max-w-7xl flex-col gap-14 px-4 pb-20 pt-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
      {/* Background Radial Glow & Tech Grid */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[180px]" />

      {/* Left Column - Copy & CTA */}
      <div className="max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-blue-400" /> Enterprise Multimodal AI Platform
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Enterprise Invoice Automation Powered by{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Multimodal AI
            </span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Automate accounts payable with hybrid Tesseract OCR + Gemini 2.5 Vision field extraction, real-time duplicate risk detection, dual currency tracking (₹ & $), and role-isolated manager signoffs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-[1.02] active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-md transition hover:border-slate-700 hover:text-white"
            >
              <Play className="h-4 w-4 fill-current text-blue-400" /> Live Platform Demo
            </a>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 98%+ Field Accuracy
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" /> Dual INR / USD Ledger
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" /> Gemini Vision Fallback
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Animated Dashboard Mockup & Floating Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-xl rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        {/* Floating Top Badge Card */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-5 py-4 border border-slate-800 shadow-lg">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Extracted Vendor & GSTIN</p>
            <h2 className="text-base font-bold text-white mt-0.5">Spectrum Tech Supplies</h2>
            <p className="text-[11px] font-mono text-blue-400">27ABCDE1234F1ZH</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> 98.6% Match
          </span>
        </div>

        {/* Dashboard Mockup Grid */}
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Invoice Number</p>
                <p className="mt-1 text-sm font-mono font-bold text-blue-400">INV-2026-0089</p>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Total Amount</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <p className="text-sm font-bold text-white">₹1,58,200</p>
                  <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-300 border border-blue-500/30">
                    $1,894 eqv
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Payment Terms</p>
                <p className="mt-1 text-sm font-mono font-bold text-slate-300">Net 30 Days</p>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Approval Workflow</p>
                <span className="mt-1 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-amber-400">
                  Awaiting Manager
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-blue-500/10 border border-blue-500/30 px-5 py-3.5 text-slate-100">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-blue-400" /> Mandatory Fields Cleared
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 font-mono">Vendor, Inv #, Date, Total & Tax Validated</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-400">
              Gemini Vision <Zap className="h-3.5 w-3.5 fill-current" />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
