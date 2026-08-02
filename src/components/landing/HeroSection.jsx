import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Zap, ShieldCheck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]"></div>

      <div className="max-w-2xl space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-indigo-400" /> AI-Powered Invoice Automation Platform
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Automate Invoice Processing with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent">AI Precision</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Instantly extract GST, line items, and vendor data with 99%+ OCR accuracy. Automate manager approval workflows and sync directly to your ERP.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-md transition hover:bg-slate-700 hover:text-white"
            >
              <Play className="h-4 w-4 fill-current text-indigo-400" /> Watch Live Demo
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/80 px-5 py-4 border border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">OCR Extracted Invoice</p>
            <h2 className="text-base font-bold text-white mt-0.5">Spectrum Supplies Ltd</h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> 99.4% Match
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Number</p>
                <p className="mt-1 text-sm font-mono font-bold text-indigo-400">INV-2026-0045</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Amount</p>
                <p className="mt-1 text-sm font-bold text-white">₹158,200</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</p>
                <p className="mt-1 text-sm font-bold text-amber-400">Aug 7, 2026</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</p>
                <span className="mt-1 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-400">
                  Pending Review
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-indigo-500/10 border border-indigo-500/30 px-5 py-3.5 text-slate-100">
            <div>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Automated Validation</p>
              <p className="text-xs text-slate-300 mt-0.5">GST 18% Verified • No Duplicate Found</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-indigo-400">
              Auto Parsed <Zap className="h-3.5 w-3.5 fill-current" />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

