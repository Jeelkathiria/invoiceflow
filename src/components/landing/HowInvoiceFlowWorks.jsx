import { motion } from 'framer-motion'
import {
  Upload,
  Cpu,
  ShieldCheck,
  Brain,
  Search,
  UserCheck,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const pipelineSteps = [
  {
    step: '01',
    title: 'Upload Invoice',
    icon: Upload,
    tech: 'Client & Multer Buffer',
    description: 'Finance Executives stage PDF/image documents with file type & size validation.',
    color: '#3b82f6', // blue
  },
  {
    step: '02',
    title: 'OCR Processing',
    icon: Cpu,
    tech: 'Tesseract.js Engine',
    description: 'Pre-parses document text and computes word-level confidence metrics locally.',
    color: '#06b6d4', // cyan
  },
  {
    step: '03',
    title: 'Quality Rule Engine',
    icon: ShieldCheck,
    tech: 'Confidence Guard',
    description: 'Evaluates required field presence and 90% confidence threshold floor.',
    color: '#eab308', // amber
  },
  {
    step: '04',
    title: 'Gemini AI Fallback',
    icon: Brain,
    tech: 'Gemini 2.5 Flash Vision',
    description: 'Multimodal vision model triggers dynamically for low-confidence or missing fields.',
    color: '#a855f7', // purple
  },
  {
    step: '05',
    title: 'Duplicate Detection',
    icon: Search,
    tech: 'Multi-Attribute Matcher',
    description: 'Cross-checks vendor GSTIN, invoice #, date, and amount against existing database records.',
    color: '#f43f5e', // rose
  },
  {
    step: '06',
    title: 'Approval Workflow',
    icon: UserCheck,
    tech: 'RBAC Queue Isolation',
    description: 'Routes validated records to Manager Queue for split-screen signoff or reasoned rejection.',
    color: '#10b981', // emerald
  },
  {
    step: '07',
    title: 'MongoDB Persistence',
    icon: Database,
    tech: 'Mongoose Ledger',
    description: 'Stores final audit-logged invoice record and syncs with Shadcn analytics charts.',
    color: '#3b82f6', // blue
  },
]

export function HowInvoiceFlowWorks() {
  return (
    <section id="workflow" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[160px]" />

      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> VISUAL WORKFLOW PIPELINE
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          How InvoiceFlow Works
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Sequential step-by-step document lifecycle from raw client upload to MongoDB ledger storage.
        </p>
      </div>

      {/* PIPELINE CARDS GRID */}
      <div className="relative">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 relative">
          {pipelineSteps.map((step, idx) => {
            const IconComp = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="relative group rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl font-bold shadow-md group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${step.color}20`,
                        color: step.color,
                        border: `1px solid ${step.color}40`,
                      }}
                    >
                      <IconComp className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-mono font-extrabold text-slate-500">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {step.title}
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mt-0.5">
                    {step.tech}
                  </span>
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow indicator between steps (desktop) */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-400 shadow-sm">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
