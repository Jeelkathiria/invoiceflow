import { motion } from 'framer-motion'
import { XCircle, CheckCircle2, ShieldAlert, Sparkles, Building2 } from 'lucide-react'

export function EnterpriseComparison() {
  const traditionalPoints = [
    { title: 'Manual Data Entry', desc: 'Hours spent manually re-keying invoice numbers, amounts, and GST totals into spreadsheets.' },
    { title: 'Lost Invoices', desc: 'Paper bills and PDF attachments buried or misplaced across chaotic email inboxes.' },
    { title: 'Duplicate Payments', desc: 'Overpayments occurring due to lack of real-time duplicate checking mechanisms.' },
    { title: 'Slow Approvals', desc: 'Unstructured email threads delaying vendor payments for weeks at a time.' },
    { title: 'No Audit Trail', desc: 'Zero compliance visibility or recorded history of who reviewed or approved bills.' },
  ]

  const invoiceFlowPoints = [
    { title: 'AI Extraction', desc: 'Google Gemini AI parses vendor, GSTIN, dates, totals, and line items in seconds.' },
    { title: 'Centralized Invoice Management', desc: 'Single source of truth for all invoice ledgers, search, filtering, and document previews.' },
    { title: 'Duplicate Detection', desc: 'Real-time detection engine flags matching vendor, invoice #, and amount before approval.' },
    { title: 'Role-Based Approvals', desc: 'Streamlined approval queue for Managers and Finance with 1-click approve/reject controls.' },
    { title: 'Complete Audit History', desc: 'Permanent event logs recording every user action, timestamp, and status modification.' },
  ]

  return (
    <section id="comparison" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -z-10 h-80 w-80 rounded-full bg-rose-600/10 blur-[140px]" />
      <div className="absolute top-1/2 right-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-600/10 blur-[140px]" />

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" /> Enterprise ROI
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Designed for <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">Enterprise Finance Teams</span>
        </h2>
        <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
          See why modern finance operations choose InvoiceFlow over legacy manual accounting processes.
        </p>
      </div>

      {/* SIDE BY SIDE COMPARISON GRID */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* TRADITIONAL PROCESS CARD */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-rose-900/40 bg-slate-950/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-rose-950 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
                  <ShieldAlert className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Traditional Process</h3>
                  <p className="text-xs text-rose-400 font-medium">Manual & Error-Prone Workflow</p>
                </div>
              </div>
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase text-rose-400">
                Legacy Method
              </span>
            </div>

            <div className="space-y-4">
              {traditionalPoints.map((item) => (
                <div key={item.title} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                  <XCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-rose-900/30 bg-rose-950/20 p-4 text-center text-xs font-semibold text-rose-300">
            Higher operational overhead, risk of duplicate payouts, and compliance bottlenecks.
          </div>
        </motion.div>

        {/* INVOICEFLOW AUTOMATED CARD */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-indigo-500/50 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 p-7 sm:p-9 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl flex flex-col justify-between ring-1 ring-indigo-500/30"
        >
          {/* Popular Enterprise Badge */}
          <div className="absolute -top-3.5 right-8 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5" /> InvoiceFlow Automated
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold shadow-md">
                  <CheckCircle2 className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">InvoiceFlow Platform</h3>
                  <p className="text-xs text-indigo-300 font-medium">AI-Driven Automated Lifecycle</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400">
                10x Speed
              </span>
            </div>

            <div className="space-y-4">
              {invoiceFlowPoints.map((item) => (
                <div key={item.title} className="flex items-start gap-3.5 p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center text-xs font-bold text-indigo-200">
            99%+ OCR accuracy, instant duplicate flags, 1-click approvals, and full audit logs.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
