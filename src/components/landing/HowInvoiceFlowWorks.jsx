import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Cpu,
  Brain,
  ShieldCheck,
  FileCheck,
  UserCheck,
  CreditCard,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  ArrowDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  XCircle,
  Database,
  Cloud,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  History,
  Trash2,
  FileText,
} from 'lucide-react'

// 7 MAIN BUSINESS STEPS (LEVEL 1)
const businessSteps = [
  {
    id: 'upload',
    step: '01',
    name: 'Upload',
    title: 'Upload Invoice',
    icon: Upload,
    description: 'Finance uploads an invoice securely.',
    badge: 'PDF / JPG / PNG → Cloudinary',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    color: '#3b82f6',
  },
  {
    id: 'extract',
    step: '02',
    name: 'Extract',
    title: 'AI-Powered Extraction',
    icon: Cpu,
    description: 'InvoiceFlow extracts structured invoice information automatically.',
    badge: 'OCR First',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    color: '#a855f7',
  },
  {
    id: 'validate',
    step: '03',
    name: 'Validate',
    title: 'Validate & Detect',
    icon: ShieldCheck,
    description: 'Extracted information is checked before entering the approval workflow.',
    badge: 'Risk Guard',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    color: '#f59e0b',
  },
  {
    id: 'review',
    step: '04',
    name: 'Review',
    title: 'Finance Review',
    icon: FileCheck,
    description: 'Finance reviews the extracted information before submitting it.',
    badge: 'Executive Review',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    color: '#0284c7',
  },
  {
    id: 'approve',
    step: '05',
    name: 'Approve',
    title: 'Manager Approval',
    icon: UserCheck,
    description: 'Managers review invoices and make the final approval decision.',
    badge: 'Approval & Rejection Loop',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    color: '#10b981',
  },
  {
    id: 'pay',
    step: '06',
    name: 'Pay',
    title: 'Payment Queue',
    icon: CreditCard,
    description: 'Approved invoices move to the Finance payment queue.',
    badge: 'Staged Disbursement',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    color: '#06b6d4',
  },
  {
    id: 'complete',
    step: '07',
    name: 'Complete',
    title: 'Paid & Audited',
    icon: CheckCircle2,
    description: 'Once payment is completed, InvoiceFlow records final status and maintains full audit history.',
    badge: 'Ledger Audit',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    color: '#10b981',
  },
]

export function HowInvoiceFlowWorks() {
  const [activeStep, setActiveStep] = useState('upload')
  const [showTechnicalArch, setShowTechnicalArch] = useState(false)

  // Listen for navigation clicks to #architecture and auto-open dropdown
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#architecture' || window.location.hash === '#architecture-section') {
        setShowTechnicalArch(true)
        setTimeout(() => {
          const el = document.getElementById('architecture')
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 150)
      }
    }

    handleHashCheck()
    window.addEventListener('hashchange', handleHashCheck)
    window.addEventListener('open-architecture', handleHashCheck)
    return () => {
      window.removeEventListener('hashchange', handleHashCheck)
      window.removeEventListener('open-architecture', handleHashCheck)
    }
  }, [])

  const currentStep = businessSteps.find((s) => s.id === activeStep) || businessSteps[0]

  return (
    <section id="workflow" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[180px]" />

      {/* SECTION HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> BUSINESS WORKFLOW & ARCHITECTURE
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          How InvoiceFlow Works
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
          From invoice upload to payment, InvoiceFlow automates the repetitive finance workflow while keeping important decisions under human control.
        </p>
      </div>

      {/* ========================================================= */}
      {/* LEVEL 1: SIMPLE 7-STEP BUSINESS FLOW (CONNECTED CARDS)    */}
      {/* ========================================================= */}
      <div className="space-y-10">
        {/* STEP CARDS NAVIGATION BAR */}
        <div className="relative">
          {/* Desktop Horizontal Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 hidden -translate-y-1/2 lg:block h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 z-0 opacity-30" />

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 relative z-10">
            {businessSteps.map((step, idx) => {
              const IconComp = step.icon
              const isActive = activeStep === step.id

              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'border-blue-500 bg-slate-900 shadow-xl ring-2 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-slate-500">
                      {step.step}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition-transform ${
                        isActive ? 'scale-110 shadow-md' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: `${step.color}20`,
                        color: step.color,
                        border: `1px solid ${step.color}40`,
                      }}
                    >
                      <IconComp className="h-4 w-4 stroke-[2.2]" />
                    </div>
                  </div>

                  <div className="w-full text-center sm:text-left">
                    <h3 className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {step.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {step.title}
                    </p>
                  </div>

                  {/* Active Step Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="mt-2 h-1 w-full rounded-full bg-blue-500 shadow-xs"
                    />
                  )}

                  {/* Connecting Arrow for Desktop */}
                  {idx < businessSteps.length - 1 && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-500">
                      <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ACTIVE STEP DETAILED DISPLAY CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-slate-800/90 bg-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Left Side: Step Info & Explanation */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 font-mono font-bold text-sm border border-blue-500/30">
                    {currentStep.step}
                  </span>
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${currentStep.badgeColor}`}>
                      {currentStep.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {currentStep.description}
                </p>

                {/* STEP-SPECIFIC CHIPS / HIGHLIGHTS */}
                {currentStep.id === 'upload' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                      <Upload className="h-4 w-4" /> Secure Client Ingestion
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      Supports high-resolution PDF, JPG, and PNG documents. Images are securely hosted on Cloudinary CDN.
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono">PDF</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono">JPG</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono">PNG</span>
                      <span className="text-blue-400 font-bold">→ Cloudinary CDN</span>
                    </div>
                  </div>
                )}

                {currentStep.id === 'extract' && (
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                        <Brain className="h-4 w-4" /> Hybrid Extraction Flow
                      </span>
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                        OCR First Policy
                      </span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Clean Invoice → Tesseract OCR (Zero AI Token Cost)
                      </div>
                      <div className="flex items-center gap-2 text-purple-300">
                        <Brain className="h-3.5 w-3.5" /> Difficult / Skewed Invoice → Gemini 2.5 Vision Fallback
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-normal">
                      Gemini Multimodal AI vision model is invoked dynamically only when OCR confidence falls below 90% or mandatory fields are unreadable.
                    </p>
                  </div>
                )}

                {currentStep.id === 'validate' && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Defensive Rule Validation Checks
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Required Fields</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> GSTIN Format</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Amount Validation</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Line Item Math</div>
                      <div className="col-span-2 flex items-center gap-1.5 text-rose-400 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" /> Duplicate Matcher (GSTIN + Inv # + Amount)
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === 'review' && (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2 font-mono text-xs text-slate-300">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4" /> Staged Finance Verification
                    </span>
                    <p className="text-slate-400 font-sans text-xs">
                      Finance Executives inspect extracted vendor metadata, taxes, and total values before submitting to the Manager Queue.
                    </p>
                  </div>
                )}

                {currentStep.id === 'approve' && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" /> Manager Signoff & Rejection Loop
                      </span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> APPROVE → Moves to Payment Queue Stage
                      </div>
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <XCircle className="h-3.5 w-3.5" /> REJECT → Requires Mandatory Feedback Reason
                      </div>
                    </div>
                    {/* Animated Rejection Loop Visual */}
                    <div className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px] font-mono text-amber-400">
                      <span>Reject</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Correction</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Resubmit</span>
                      <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                    </div>
                  </div>
                )}

                {currentStep.id === 'pay' && (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2 font-mono text-xs text-slate-300">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" /> Finance Disbursement Staging
                    </span>
                    <p className="text-slate-400 font-sans text-xs">
                      Finance team handles wire transfers through the company's existing banking portal, then logs settlement proof on InvoiceFlow via <strong>"Mark as Paid"</strong>.
                    </p>
                  </div>
                )}

                {currentStep.id === 'complete' && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Immutable Audit Trail
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                      <div>✓ Status: Paid</div>
                      <div>✓ Payment Date Logged</div>
                      <div>✓ Paid By Executive</div>
                      <div>✓ Complete Audit History</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Interactive UI Mockup Preview */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
                  {/* Top Bar of Mockup */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-slate-400 font-bold ml-2">
                        InvoiceFlow • {currentStep.title} Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                      Live Step {currentStep.step}
                    </span>
                  </div>

                  {/* UI Mockup Content Based on Step */}
                  {currentStep.id === 'upload' && (
                    <div className="space-y-4 py-3">
                      <div className="rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-950/10 p-6 text-center space-y-2">
                        <Upload className="h-10 w-10 text-blue-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">Drag and drop invoice document</h4>
                        <p className="text-xs text-slate-400 font-mono">Supports PDF, PNG, JPG up to 10MB</p>
                        <span className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md mt-2">
                          Select Document
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span>Status: Cloudinary Staging CDN</span>
                        <span className="text-emerald-400 font-bold">✓ Ready for Extraction</span>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'extract' && (
                    <div className="space-y-3 py-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Path A • Clean Layout</span>
                          <h5 className="text-xs font-bold text-white mt-1">Tesseract OCR Parse</h5>
                          <p className="text-[11px] text-slate-400 mt-1">Instant local text extraction with zero external token fee.</p>
                          <span className="inline-block mt-2 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                            Score ≥ 90%
                          </span>
                        </div>
                        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5">
                          <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Path B • Skewed / Hard</span>
                          <h5 className="text-xs font-bold text-white mt-1">Gemini 2.5 Vision</h5>
                          <p className="text-[11px] text-slate-400 mt-1">Multimodal vision AI extracts complex tables & handwritten fields.</p>
                          <span className="inline-block mt-2 text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                            Dynamic Fallback
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                        <span>Extracted Metadata Tokens</span>
                        <span className="text-purple-400 font-bold">20/20 Cleared</span>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'validate' && (
                    <div className="space-y-3 py-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 font-mono text-xs">
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>✓ Mandatory Fields Check (Vendor, Inv #, Date, Amount)</span>
                          <span className="font-bold">PASSED</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>✓ GSTIN Format Regex Validation</span>
                          <span className="font-bold">27ABCDE1234F1ZH</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>✓ Line Item Subtotal & Tax Calculation</span>
                          <span className="font-bold">₹1,58,200</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2">
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <Search className="h-3.5 w-3.5" /> Duplicate Risk Check
                          </span>
                          <span className="text-emerald-400 font-bold">No Match Found (Clean)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'review' && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Vendor Name</span>
                          <p className="font-bold text-white">Spectrum Tech Supplies</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase">Total Amount</span>
                          <p className="font-bold text-blue-400">₹1,58,200 ($1,894 eqv)</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>Invoice #: <span className="text-white font-bold">INV-2026-0089</span></div>
                        <div>Date: <span className="text-white font-bold">2026-08-15</span></div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-2">
                          <span>Send for Manager Approval</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'approve' && (
                    <div className="space-y-3 py-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Manager Signoff Interface</span>
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">
                            Awaiting Manager
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div>
                            <p className="font-bold text-white">INV-2026-0089</p>
                            <p className="text-[11px] text-slate-400">Spectrum Tech Supplies • ₹1,58,200</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 text-xs font-bold hover:bg-rose-600 hover:text-white transition">
                              Reject
                            </button>
                            <button className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-500 transition shadow-md">
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'pay' && (
                    <div className="space-y-3 py-2 font-mono text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold">Disbursement Queue</span>
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                            Approved Stage
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div>
                            <p className="font-bold text-white">Spectrum Tech Supplies</p>
                            <p className="text-[11px] text-slate-400">Due in 3 Days • ₹1,58,200</p>
                          </div>
                          <button className="rounded-lg bg-cyan-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-cyan-500 transition shadow-md flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark as Paid</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Payment processed via external corporate banking portal.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'complete' && (
                    <div className="space-y-3 py-2 font-mono text-xs">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Settled Ledger Entry
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                            PAID
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                          <div>Invoice: <span className="text-white font-bold">INV-2026-0089</span></div>
                          <div>Amount: <span className="text-white font-bold">₹1,58,200</span></div>
                          <div>Payment Date: <span className="text-white">2026-08-20</span></div>
                          <div>Tx Ref #: <span className="text-blue-400 font-bold">TXN-984210</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* LEVEL 2: COMPREHENSIVE TECHNICAL ARCHITECTURE DIAGRAM    */}
      {/* ========================================================= */}
      <div id="architecture" className="mt-16 text-center space-y-6">
        <button
          onClick={() => setShowTechnicalArch(!showTechnicalArch)}
          className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-3.5 text-xs font-mono font-bold text-slate-200 shadow-xl transition hover:border-blue-500/50 hover:bg-slate-900 hover:text-white cursor-pointer focus:outline-none"
        >
          <GitBranch className="h-4 w-4 text-blue-400" />
          <span>{showTechnicalArch ? 'Hide Technical Architecture' : 'View Technical Architecture'}</span>
          {showTechnicalArch ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* EXPANDABLE COMPLETE TECHNICAL ARCHITECTURE DIAGRAM */}
        <AnimatePresence>
          {showTechnicalArch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden pt-4"
            >
              <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800/90 bg-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-left space-y-6 font-mono">
                {/* Tech Diagram Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Level 2 • End-to-End System Architecture
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      InvoiceFlow Full Technical Execution Pipeline
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-mono text-slate-400 border border-slate-800">
                    Complete Lifecycle Flow
                  </span>
                </div>

                {/* FLOWCHART CANVAS */}
                <div className="flex flex-col items-center space-y-3 text-xs">
                  {/* 1. Ingestion Node */}
                  <div className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-slate-900/90 p-4 text-center shadow-lg">
                    <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">01 • Ingestion</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">FINANCE USER Uploads Invoice</h4>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 2. File Validation */}
                  <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center shadow-md">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">File Validation</span>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">PDF / JPG / PNG / Size Check</p>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 3. Upload -> Cloudinary */}
                  <div className="w-full max-w-md rounded-xl border border-sky-500/30 bg-sky-950/30 p-3 text-center shadow-md flex items-center justify-center gap-2">
                    <Cloud className="h-4 w-4 text-sky-400" />
                    <span className="font-bold text-white">Upload → Cloudinary CDN</span>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 4. OCR Processing */}
                  <div className="w-full max-w-md rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-center shadow-md flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="font-bold text-white">OCR Processing (Text + Confidence Array)</span>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 5. Quality Rule Engine / Parser Evaluation Box */}
                  <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 space-y-2 text-center shadow-lg">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Quality Rule Engine / Parser</span>
                    <p className="text-xs text-slate-300 font-sans">Evaluating document readability, token presence & confidence floor</p>
                  </div>

                  {/* 6. CONDITIONAL BRANCHING FOR EXTRACTION MODE */}
                  <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* LEFT BRANCH: ALL CONDITIONS PASS */}
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 text-left shadow-lg">
                      <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" /> ALL CONDITIONS PASS
                        </span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          Primary Path
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                        <div>• Confidence ≥ 90%</div>
                        <div>• Mandatory fields present</div>
                        <div>• Line items extracted</div>
                        <div>• No critical errors</div>
                      </div>
                      <div className="pt-2 text-center border-t border-emerald-900/50">
                        <span className="inline-block rounded-xl bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                          OCR_ONLY
                        </span>
                      </div>
                    </div>

                    {/* RIGHT BRANCH: ANY CONDITION FAILS */}
                    <div className="rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4 space-y-2 text-left shadow-lg">
                      <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" /> ANY CONDITION FAILS
                        </span>
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          Fallback Path
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                        <div>• Confidence &lt; 90%</div>
                        <div>• Missing mandatory fields</div>
                        <div>• Table extraction fails</div>
                        <div>• Critical validation error</div>
                      </div>
                      <div className="pt-2 text-center border-t border-purple-900/50">
                        <span className="inline-block rounded-xl bg-purple-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                          GEMINI VISION FALLBACK
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowDown className="h-4 w-4 text-cyan-400 mt-2" />

                  {/* 7. Structured Invoice JSON */}
                  <div className="w-full max-w-md rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-3.5 text-center shadow-md">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">Standardized JSON</span>
                    <p className="font-bold text-white mt-0.5">Structured Invoice JSON Object</p>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 8. Field Normalization */}
                  <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center shadow-md">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Normalization Engine</span>
                    <p className="font-bold text-white mt-0.5">Normalize + Validate Fields (ISO Date, Tax, Float)</p>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 9. Duplicate Detection */}
                  <div className="w-full max-w-md rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-center shadow-md flex items-center justify-center gap-2">
                    <Search className="h-4 w-4 text-rose-400" />
                    <span className="font-bold text-white">Duplicate Detection Engine</span>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 10. Generate Extraction Report */}
                  <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-center shadow-md">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Report Generator</span>
                    <p className="font-bold text-white mt-0.5">Generate Extraction Report & Audit Metadata</p>
                  </div>

                  <ArrowDown className="h-4 w-4 text-slate-500" />

                  {/* 11. Staging Preview */}
                  <div className="w-full max-w-md rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-3.5 text-center shadow-md">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">Staging Review UI</span>
                    <p className="font-bold text-white mt-0.5">Show Preview to Finance Executive</p>
                  </div>

                  {/* 12. STAGING ACTION BRANCH (CANCEL vs SAVE) */}
                  <div className="w-full max-w-xl grid grid-cols-2 gap-4 pt-2">
                    {/* CANCEL */}
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-center shadow-md">
                      <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-center gap-1">
                        <Trash2 className="h-3 w-3" /> CANCEL
                      </span>
                      <p className="text-xs text-slate-300 font-bold mt-1">Delete Cloudinary File</p>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">Discard Staging & Exit</p>
                    </div>

                    {/* SAVE */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-center shadow-md">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" /> SAVE
                      </span>
                      <p className="text-xs text-white font-bold mt-1">Save MongoDB Record</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">→ PENDING_APPROVAL</p>
                    </div>
                  </div>

                  <ArrowDown className="h-4 w-4 text-emerald-400 mt-2" />

                  {/* 13. MANAGER REVIEW STAGE */}
                  <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 text-center shadow-lg">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">05 • Governance</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">MANAGER REVIEWS INVOICE</h4>
                  </div>

                  {/* 14. MANAGER DECISION BRANCH (APPROVE vs REJECT) */}
                  <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* APPROVE BRANCH */}
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-left shadow-lg space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase block border-b border-emerald-900/50 pb-1">
                        ✓ APPROVE
                      </span>
                      <p className="text-xs font-mono text-slate-200">
                        Status transitions to:
                      </p>
                      <div className="rounded-xl bg-cyan-950/50 border border-cyan-500/30 p-2.5 text-center text-cyan-300 font-bold text-xs">
                        PAYMENT_QUEUE
                      </div>
                    </div>

                    {/* REJECT & CORRECTION LOOP BRANCH */}
                    <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-left shadow-lg space-y-2">
                      <span className="text-xs font-bold text-rose-400 uppercase block border-b border-rose-900/50 pb-1">
                        ✕ REJECT
                      </span>
                      <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                        <div className="text-rose-300 font-bold">→ NEEDS_CORRECTION</div>
                        <div className="text-slate-400">↓ FINANCE EDITS</div>
                        <div className="text-blue-400 font-bold">↓ RESUBMITS</div>
                        <div className="text-amber-300">↓ PENDING_APPROVAL</div>
                        <div className="text-white font-bold">↓ MANAGER REVIEWS (Approve / Reject)</div>
                      </div>
                    </div>
                  </div>

                  <ArrowDown className="h-4 w-4 text-cyan-400 mt-2" />

                  {/* 15. PAYMENT DISBURSEMENT STAGE */}
                  <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 text-center shadow-lg space-y-2">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">06 • Disbursement</span>
                    <h4 className="text-xs font-bold text-white">FINANCE PAYS EXTERNALLY</h4>
                    <p className="text-[11px] text-slate-400 font-sans">Payment processed via company banking system</p>
                    <div className="pt-1">
                      <span className="inline-block rounded-xl bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white shadow-md">
                        MARK AS PAID
                      </span>
                    </div>
                  </div>

                  <ArrowDown className="h-4 w-4 text-emerald-400" />

                  {/* 16. FINAL SETTLEMENT & AUDIT */}
                  <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-center shadow-lg space-y-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">07 • Settlement</span>
                    <h4 className="text-sm font-black text-emerald-300">PAID</h4>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center gap-2">
                      <History className="h-3.5 w-3.5 text-emerald-400" />
                      <span>AUDIT TRAIL / HISTORY RECORDED</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default HowInvoiceFlowWorks
