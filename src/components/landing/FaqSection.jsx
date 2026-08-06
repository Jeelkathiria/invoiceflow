import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react'

const faqs = [
  {
    question: 'How does InvoiceFlow achieve 98%+ extraction accuracy?',
    answer: 'InvoiceFlow utilizes a two-tier hybrid AI pipeline. First, Tesseract.js performs local OCR text pre-parsing. If OCR confidence falls below 90% or mandatory fields are missing, Google Gemini 2.5 Flash Vision evaluates the raw document image directly to extract complex, unstructured, or handwritten invoice fields.',
  },
  {
    question: 'How does the multi-currency engine calculate totals?',
    answer: 'The system automatically detects invoice currency tokens (INR ₹, USD $, EUR €, GBP £). Extracted totals are saved in their native currency alongside live real-time equivalencies, allowing dashboards to render aggregates in both INR and USD simultaneously.',
  },
  {
    question: 'How does Role-Based Access Control (RBAC) work?',
    answer: 'InvoiceFlow enforces strict role separation between Finance Executives and Department Managers. Finance Executives stage uploads, edit extracted drafts, and submit records. Managers access an isolated approval queue to review split-screen document views and record 1-click approvals or mandatory rejection reasons.',
  },
  {
    question: 'What happens when an invoice upload is cancelled?',
    answer: 'InvoiceFlow handles cancellation transactionally: if a user discards an extraction during staging, the original file is immediately deleted from the Cloudinary CDN, ensuring zero orphaned media files or unverified database clutter.',
  },
  {
    question: 'How does duplicate detection prevent double payments?',
    answer: 'Before saving to MongoDB, the backend cross-checks vendor GSTIN, invoice numbers, amounts, issue dates, and document hashes against existing records. High-risk duplicates trigger prominent warning badges for manager inspection.',
  },
  {
    question: 'Can InvoiceFlow be deployed on cloud platforms like Vercel and Render?',
    answer: 'Yes! The frontend is optimized for zero-config deployment on Vercel or Netlify, while the Node.js Express REST API and MongoDB Mongoose database connect seamlessly on Render, Railway, or AWS EC2.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="about" className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <HelpCircle className="h-3.5 w-3.5" /> FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Everything You Need to Know
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          Got questions about AI extraction, security, multi-currency engine, or RBAC guards? We have answers.
        </p>
      </div>

      {/* ACCORDION LIST */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-blue-500/50 bg-slate-900/90 shadow-xl'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer"
              >
                <span className="text-sm font-bold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-blue-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
