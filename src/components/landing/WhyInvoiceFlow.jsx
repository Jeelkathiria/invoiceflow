import { motion } from 'framer-motion'
import {
  Cpu,
  Brain,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

const featureCards = [
  {
    title: 'Hybrid AI Extraction',
    subtitle: 'OCR + Gemini 2.5 Vision',
    icon: Brain,
    description: 'Instant Tesseract OCR text extraction with dynamic Gemini 2.5 Flash Vision fallback for low-confidence or missing fields.',
    badge: 'Dual AI Engine',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Duplicate Prevention',
    subtitle: 'Multi-Attribute Risk Engine',
    icon: Search,
    description: 'Multi-attribute matching algorithm cross-checks vendor GSTIN, invoice #, total amount, and date against existing database records.',
    badge: 'Risk Engine',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  {
    title: 'Payment Queue Stage',
    subtitle: 'Post-Approval Disbursement',
    icon: CreditCard,
    description: 'Approved invoices move automatically to Payment Queue with due-date tracking (Due Soon, Overdue) and 1-click settlement proof.',
    badge: 'Post-Approval',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    title: 'Finance Team Module',
    subtitle: 'Manager Executive Oversight',
    icon: Users,
    badge: 'Manager Only',
    description: 'Dedicated search-indexed team directory, monthly spend analytics, donut status charts, and individual member performance drill-down.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Fix & Resubmit Flow',
    subtitle: 'Reasoned Rejection Lifecycle',
    icon: RefreshCw,
    description: 'Managers reject invoices with mandatory feedback. Finance Executives fix errors on split-screen UI and resubmit with audit diff logs.',
    badge: 'Audit Trail',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    title: 'Role-Based Security',
    subtitle: 'Strict RBAC Data Isolation',
    icon: UserCheck,
    description: 'Finance Users view isolated personal ledgers. Managers hold organizational oversight and approval controls.',
    badge: 'RBAC Security',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'Defensive Data Rules',
    subtitle: 'Quality & Field Clearance',
    icon: ShieldCheck,
    description: 'Automated field completeness checks validate required data, ISO dates, line item totals, and GSTIN formatting.',
    badge: 'Quality Floor',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    title: 'Dual Currency Ledger',
    subtitle: 'INR ₹ & USD $ Support',
    icon: Cpu,
    description: 'Supports real-time dual currency formatting, automatic conversion, and multi-currency aggregate total calculations.',
    badge: 'Multi-Currency',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
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
          Comprehensive accounts payable automation engineered for accuracy, speed, role isolation, and audit transparency.
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

export default WhyInvoiceFlow
