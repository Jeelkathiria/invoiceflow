import { motion } from 'framer-motion'
import {
  Cpu,
  Brain,
  FileSearch,
  CheckSquare,
  Sparkles,
  Zap,
} from 'lucide-react'

const aiCapabilities = [
  {
    title: 'OCR Processing',
    subtitle: 'Tesseract.js Pre-Parser',
    icon: Cpu,
    description: 'Scans documents to extract text nodes and per-word confidence metrics locally before invoking external APIs.',
    color: '#06b6d4',
  },
  {
    title: 'Gemini Fallback',
    subtitle: 'Gemini 2.5 Flash Vision',
    icon: Brain,
    description: 'Dynamic fallback sends original document images to Gemini Vision when OCR confidence drops below 90%.',
    color: '#a855f7',
  },
  {
    title: 'Smart Field Extraction',
    subtitle: '20+ Structured Tokens',
    icon: FileSearch,
    description: 'Extracts vendor, GSTIN, invoice #, PO #, issue & due dates, subtotals, tax breakdown, and itemized tables.',
    color: '#3b82f6',
  },
  {
    title: 'Validation Engine',
    subtitle: 'Format & Type Checkers',
    icon: CheckSquare,
    description: 'Normalizes ISO 8601 dates, parses float amounts, checks GSTIN regex, and flags missing mandatory fields.',
    color: '#eab308',
  },
  {
    title: 'Approval Suggestions',
    subtitle: 'Risk & Confidence Rating',
    icon: Zap,
    description: 'Generates confidence scores and duplicate risk flags to recommend 1-click approvals for low-risk invoices.',
    color: '#10b981',
  },
]

export function AiCapabilities() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-purple-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> AI CAPABILITIES & INTEGRATIONS
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Hybrid Multimodal Extraction Intelligence
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Combining local OCR speed with Google Gemini 2.5 Vision accuracy for 99%+ field extraction precision.
        </p>
      </div>

      {/* 5 CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {aiCapabilities.map((cap, idx) => {
          const IconComp = cap.icon
          return (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold shadow-md group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: `${cap.color}18`,
                      color: cap.color,
                      border: `1px solid ${cap.color}35`,
                    }}
                  >
                    <IconComp className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="rounded-md bg-slate-950 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 border border-slate-800">
                    AI Layer 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {cap.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {cap.subtitle}
                </p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
