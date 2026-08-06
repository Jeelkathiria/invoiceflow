import { motion } from 'framer-motion'
import {
  Cpu,
  Brain,
  Search,
  ShieldCheck,
  UserCheck,
  Cloud,
  BarChart3,
  Server,
  Sparkles,
} from 'lucide-react'

const featureCards = [
  {
    title: 'OCR First',
    subtitle: 'Fast Local Pre-Parser',
    icon: Cpu,
    description: 'Instant client & server Tesseract.js text extraction with zero external API costs for clean document layouts.',
    badge: 'Tesseract OCR',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'AI Extraction',
    subtitle: 'Gemini 2.5 Flash Vision',
    icon: Brain,
    description: 'Dynamic multimodal AI fallback parses complex tables, skewed scans, handwritten notes, and 20+ metadata tokens.',
    badge: 'Multimodal AI',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Duplicate Detection',
    subtitle: 'Risk Prevention Engine',
    icon: Search,
    description: 'Multi-attribute matching algorithm evaluates vendor GSTIN, invoice #, amount, date, and document hashes in real time.',
    badge: 'Risk Prevention',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  {
    title: 'Smart Validation',
    subtitle: 'Defensive Data Engine',
    icon: ShieldCheck,
    description: 'Automated field completeness checks highlight missing mandatory data and standardizes dates, tax, and GSTIN formats.',
    badge: 'Field Rules',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    title: 'Role Based Approval',
    subtitle: 'Finance Exec vs Manager Guards',
    icon: UserCheck,
    description: 'Strict RBAC isolation ensures Finance Executives upload and edit, while Managers review split-screen signoffs.',
    badge: 'RBAC Isolation',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'Secure Storage',
    subtitle: 'Cloudinary CDN + MongoDB',
    icon: Cloud,
    description: 'Original invoices are stored securely on Cloudinary CDN with transactional cleanup if staging is cancelled.',
    badge: 'Cloud CDN',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  {
    title: 'Analytics',
    subtitle: 'Shadcn Recharts Vector Suite',
    icon: BarChart3,
    description: 'Interactive spline trends, stacked bar charts, donut category spend, and real-time dual currency (INR ₹ / USD $) toggles.',
    badge: 'Shadcn Charts',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    title: 'Cloud Ready',
    subtitle: 'Enterprise SaaS Deployment',
    icon: Server,
    description: 'Built with React 19, Node.js REST API, and production-ready Vercel & Render infrastructure.',
    badge: 'Production Build',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
]

export function WhyInvoiceFlow() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> WHY INVOICEFLOW
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Built for Modern Enterprise Finance Teams
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Comprehensive accounts payable automation engineered for accuracy, speed, and audit transparency.
        </p>
      </div>

      {/* 8 FEATURE CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((card, idx) => {
          const IconComp = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="relative group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgColor} ${card.color} border ${card.borderColor} group-hover:scale-110 transition-transform`}>
                    <IconComp className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="rounded-md bg-slate-950 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 border border-slate-800">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {card.subtitle}
                </p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
