import { motion } from 'framer-motion'
import {
  Bot,
  ShieldCheck,
  Users,
  Zap,
  LineChart,
  History,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    title: 'AI Invoice Extraction',
    icon: Bot,
    description: 'Automatically extracts invoice number, vendor, GST, totals, dates and line items using Gemini AI with 99%+ OCR accuracy.',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/10',
    badge: 'Gemini AI Powered',
  },
  {
    title: 'Duplicate Detection',
    icon: ShieldCheck,
    description: 'Detect duplicate invoices before they enter the approval workflow using multi-attribute cross-checking.',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    shadow: 'shadow-amber-500/10',
    badge: 'Risk Prevention',
  },
  {
    title: 'Role-Based Workflow',
    icon: Users,
    description: 'Separate experiences for Finance and Managers with secure role-based access and data isolation.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    shadow: 'shadow-cyan-500/10',
    badge: 'Enterprise RBAC',
  },
  {
    title: 'Fast Approval Workflow',
    icon: Zap,
    description: 'Managers approve or reject invoices with custom comments in just a few clicks with instant state persistence.',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    shadow: 'shadow-emerald-500/10',
    badge: '1-Click Review',
  },
  {
    title: 'Real-time Dashboard',
    icon: LineChart,
    description: 'Track uploaded, pending, approved and rejected invoices with dynamic financial metrics and charts.',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    shadow: 'shadow-purple-500/10',
    badge: 'Live Analytics',
  },
  {
    title: 'Audit Trail',
    icon: History,
    description: 'Maintain complete history of every invoice action with detailed event logs, timestamps, and user tracking.',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    shadow: 'shadow-sky-500/10',
    badge: 'Compliance Ready',
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-10 -z-10 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-80 w-80 rounded-full bg-indigo-600/15 blur-[140px]" />

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Enterprise Capabilities
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Built for <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">Modern Finance Teams</span>
        </h2>
        <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
          Designed with the precision, security, and performance required by Fortune 500 accounts payable operations.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => {
          const IconComp = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -8 }}
              className={`group relative flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:${feature.shadow}`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="h-7 w-7 stroke-[2.2]" />
                  </div>
                  <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-300 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                    {feature.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Accent Bottom Line */}
              <div className="mt-8 h-1 w-full rounded-full bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-violet-500 transition-all duration-300" />
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
