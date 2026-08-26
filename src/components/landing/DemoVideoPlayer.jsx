import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight, Bot, Zap, Sparkles, Building2, User, CreditCard } from 'lucide-react'

export function DemoVideoPlayer({ onClose }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0) // 0 to 100
  const totalDurationSeconds = 20

  useEffect(() => {
    let interval = null
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0 // loop video
          }
          return prev + 0.5 // 200 ticks * 100ms = 20s
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const currentTimeSec = Math.floor((progress / 100) * totalDurationSeconds)

  // Determine current active scene based on time (0s-5s, 5s-10s, 10s-15s, 15s-20s)
  const currentScene = currentTimeSec < 5 ? 1 : currentTimeSec < 10 ? 2 : currentTimeSec < 15 ? 3 : 4

  return (
    <div className="flex flex-col w-full bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Video Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            LIVE DEMO REEL — 00:{currentTimeSec < 10 ? `0${currentTimeSec}` : currentTimeSec} / 00:20
          </span>
        </div>

        {/* Scene Indicator Badges */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
          <span className={`px-2.5 py-1 rounded-full border transition ${currentScene === 1 ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
            1. AI Extraction
          </span>
          <span className={`px-2.5 py-1 rounded-full border transition ${currentScene === 2 ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
            2. Duplicate Engine
          </span>
          <span className={`px-2.5 py-1 rounded-full border transition ${currentScene === 3 ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
            3. Manager Signoff
          </span>
          <span className={`px-2.5 py-1 rounded-full border transition ${currentScene === 4 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
            4. Payment Execution
          </span>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="relative aspect-[16/9] w-full bg-slate-950 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {/* SCENE 1: Multimodal AI Ingestion */}
          {currentScene === 1 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">Google Gemini Multimodal AI Parsing...</span>
                </div>
                <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-[11px] font-mono font-bold text-blue-300 border border-blue-500/30">
                  Step 1: Extracted PDF Data
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500">VENDOR NAME</p>
                  <p className="text-sm font-bold text-white mt-0.5">Spectrum Tech Supplies Ltd.</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500">INVOICE NUMBER</p>
                  <p className="text-sm font-bold text-blue-400 mt-0.5">INV-2026-9482</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500">TOTAL AMOUNT</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">₹1,58,200 <span className="text-[10px] text-slate-400">($1,894 eqv)</span></p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500">GSTIN / TAX ID</p>
                  <p className="text-sm font-bold text-slate-300 mt-0.5">27ABCDE1234F1ZH</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs text-blue-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Mandatory Fields Cleared
                </span>
                <span className="font-mono text-[11px]">OCR Quality Score: 98.4%</span>
              </div>
            </motion.div>
          )}

          {/* SCENE 2: Duplicate Risk Detection */}
          {currentScene === 2 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-bold text-white">Cross-User Duplicate Risk Detection</span>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-mono font-bold text-amber-300 border border-amber-500/30">
                  Risk Signal Check
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2 text-amber-200">
                <p className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400" /> DUPLICATE INVOICE DETECTED IN MONGODB
                </p>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  Original Invoice #INV-2026-9482 for Spectrum Tech Supplies (₹1,58,200) was previously uploaded by Finance Executive on 26/08/2026.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Existing Approval Status:</span>
                <span className="font-bold text-blue-400">PENDING MANAGER APPROVAL</span>
              </div>
            </motion.div>
          )}

          {/* SCENE 3: Manager Side-by-Side Review & Correction */}
          {currentScene === 3 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-bold text-white">Manager Review & Signoff Modal</span>
                </div>
                <span className="rounded-full bg-purple-500/20 px-3 py-0.5 text-[11px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  Manager Approval Workflow
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1">
                  <p className="text-slate-500 font-mono">ACTION TYPE</p>
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Route to Payment
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1">
                  <p className="text-slate-500 font-mono">REJECTION REASON</p>
                  <p className="font-bold text-purple-300">Correction Required (Edit Fields)</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-300">
                <p className="text-slate-500 text-[10px] uppercase">Manager Remarks:</p>
                <p className="italic mt-0.5">"Please update shipping tax rate from 18% to 12% before final approval."</p>
              </div>
            </motion.div>
          )}

          {/* SCENE 4: Payment Execution Queue & Audit Ledger */}
          {currentScene === 4 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-bold text-white">Payment Execution & Ledger Audit</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                  Payment Queue Verified
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500 font-mono">FINAL PAYMENT DISBURSED</p>
                  <p className="text-base font-bold text-white mt-0.5">₹1,58,200 to Spectrum Tech</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                  STATUS: PAID
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Audit Logged: Transaction recorded with user timestamps in MongoDB ledger.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Controls Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-900/90 px-6 py-4">
        {/* Progress Bar (Clickable scrubbing) */}
        <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const newPct = (clickX / rect.width) * 100
          setProgress(Math.min(100, Math.max(0, newPct)))
        }}>
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>

            <button
              onClick={() => setProgress(0)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <span className="text-xs font-mono text-slate-400">
              {isPlaying ? 'Playing Demo Reel...' : 'Paused'}
            </span>
          </div>

          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <span>Try Live Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
