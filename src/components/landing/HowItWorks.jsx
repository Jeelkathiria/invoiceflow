import { motion } from 'framer-motion'
import {
  Upload,
  Bot,
  FileEdit,
  ShieldAlert,
  Send,
  UserCheck,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'Upload Invoice',
    icon: Upload,
    description: 'Submit PDF, PNG or JPEG invoices via drag-and-drop or batch file upload with instant staging.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    title: 'AI Extracts Data',
    icon: Bot,
    description: 'Google Gemini AI parses vendor, GSTIN, dates, line items, and financial totals in seconds.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    step: '03',
    title: 'Finance Reviews',
    icon: FileEdit,
    description: 'Finance team verifies extracted data, edits line items, and validates required fields.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    step: '04',
    title: 'Duplicate Check',
    icon: ShieldAlert,
    description: 'Real-time engine cross-checks vendor, invoice #, and amount to catch duplicate bills.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    step: '05',
    title: 'Send for Approval',
    icon: Send,
    description: 'One-click submission pushes verified invoices directly to the manager approval queue.',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    step: '06',
    title: 'Manager Review',
    icon: UserCheck,
    description: 'Managers inspect line items, view original PDF documents, and review risk tags.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    step: '07',
    title: 'Approved / Rejected',
    icon: CheckCircle2,
    description: 'Decisions recorded instantly with custom remarks, status updates, and email notifications.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    step: '08',
    title: 'Dashboard & Audit',
    icon: BarChart3,
    description: 'Real-time analytics, status metrics, and permanent audit history update live.',
    gradient: 'from-cyan-500 to-blue-500',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
          End-to-End Lifecycle
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          How <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">InvoiceFlow Works</span>
        </h2>
        <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
          InvoiceFlow automates the entire invoice lifecycle—from upload to AI extraction, finance review, manager approval, and real-time tracking.
        </p>
      </div>

      {/* DESKTOP TIMELINE (GRID STEPS WITH CONNECTORS) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-6 relative">
          {/* Top Row Connectors */}
          <div className="absolute top-20 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 -z-0" />

          {steps.slice(0, 4).map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative z-10 group rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-mono font-black tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {idx < 3 && (
                  <div className="absolute -right-3 top-20 z-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-indigo-400 shadow-sm">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Connecting Row Arrow */}
        <div className="flex justify-center my-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 relative">
          {/* Bottom Row Connectors */}
          <div className="absolute top-20 left-12 right-12 h-0.5 bg-gradient-to-r from-sky-500/30 via-emerald-500/30 to-cyan-500/30 -z-0" />

          {steps.slice(4, 8).map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx + 4) * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative z-10 group rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-mono font-black tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {idx < 3 && (
                  <div className="absolute -right-3 top-20 z-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-indigo-400 shadow-sm">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* MOBILE & TABLET VERTICAL TIMELINE */}
      <div className="lg:hidden relative border-l-2 border-slate-800 pl-6 ml-4 space-y-8">
        {steps.map((item, idx) => {
          const IconComponent = item.icon
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative group rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-lg"
            >
              {/* Timeline Bullet Node */}
              <div className={`absolute -left-[37px] top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-white shadow-md ring-4 ring-slate-950`}>
                <IconComponent className="h-4 w-4 stroke-[2.2]" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-indigo-400">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
