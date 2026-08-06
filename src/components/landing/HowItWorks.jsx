import { motion } from 'framer-motion'
import {
  Upload,
  Cpu,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const workflowSteps = [
  {
    step: '01',
    title: 'Upload & Ingest',
    icon: Upload,
    subtitle: 'Multimodal Document Intake',
    description: 'Finance Executives drag & drop PDF, PNG, or JPEG files with client-side format checks and Cloudinary CDN staging.',
    gradient: 'from-blue-500 to-cyan-500',
    color: '#0ea5e9',
    badge: 'Step 01',
  },
  {
    step: '02',
    title: 'Hybrid AI Extraction',
    icon: Cpu,
    subtitle: 'Tesseract OCR + Gemini 2.5',
    description: 'Deterministic OCR parses raw text; low confidence triggers Gemini 2.5 Flash Vision for 20+ fields & missing field flags.',
    gradient: 'from-indigo-500 to-purple-500',
    color: '#a855f7',
    badge: 'Step 02',
  },
  {
    step: '03',
    title: 'Audit & Multi-Currency',
    icon: Globe,
    subtitle: 'Risk Guard & Dual Conversion',
    description: 'Real-time duplicate detection cross-checks vendor, invoice #, and amount while converting INR (₹), USD ($), EUR (€), and GBP (£).',
    gradient: 'from-amber-500 to-orange-500',
    color: '#eab308',
    badge: 'Step 03',
  },
  {
    step: '04',
    title: 'Manager Signoff & Sync',
    icon: CheckCircle2,
    subtitle: 'Audit Logging & Analytics',
    description: 'Managers inspect split-screen document views, record reasoned signoffs or rejections, and update live Shadcn vector charts.',
    gradient: 'from-emerald-500 to-teal-500',
    color: '#22c55e',
    badge: 'Step 04',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[150px]" />

      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" /> USER WORKFLOW
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          How InvoiceFlow Streamlines Accounts Payable
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          A friction-free four-stage workflow designed for Finance Executives and Department Managers.
        </p>
      </div>

      {/* 4-STEP HORIZONTAL GRID TIMELINE */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
        {workflowSteps.map((step, idx) => {
          const IconComp = step.icon
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative group rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Step Header Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <IconComp className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span
                    className="rounded-md px-2.5 py-1 text-[11px] font-mono font-extrabold"
                    style={{
                      backgroundColor: `${step.color}15`,
                      color: step.color,
                      border: `1px solid ${step.color}35`,
                    }}
                  >
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  {step.subtitle}
                </p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Connector Indicator */}
              {idx < workflowSteps.length - 1 && (
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-400 shadow-md">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
