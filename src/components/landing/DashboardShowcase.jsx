import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  UserCheck,
  Upload,
  Clock,
  FileText,
  ShieldCheck,
  IndianRupee,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const showcaseTabs = [
  {
    id: 'finance-dashboard',
    label: 'Finance Dashboard',
    icon: LayoutDashboard,
    badge: 'Finance Exec View',
    title: 'Real-Time Financial Analytics & Spend Overview',
    description: 'Track total processed volumes, approval queues, duplicate risk alerts, and dual-currency spend distributions with Shadcn Recharts vector graphs.',
    mockup: {
      metrics: [
        { label: 'Total Invoices Processed', val: '1,420', sub: '₹2.48 Crore ($297k eqv)' },
        { label: 'Awaiting Manager Signoff', val: '14', sub: '₹18.40 Lakh ($22.0k eqv)' },
        { label: 'Duplicate Prevention Rate', val: '99.8%', sub: '42 High-Risk Flagged' },
      ],
      previewTitle: 'Executive Spend Summary',
      items: [
        { inv: 'INV-2026-0089', vendor: 'Spectrum Tech Supplies', amount: '₹1,58,200', usd: '$1,894', status: 'Approved' },
        { inv: 'INV-2026-0090', vendor: 'CloudScale Systems', amount: '₹4,25,000', usd: '$5,089', status: 'Pending Review' },
        { inv: 'INV-2026-0091', vendor: 'Apex Office Solutions', amount: '₹84,500', usd: '$1,012', status: 'Approved' },
      ],
    },
  },
  {
    id: 'manager-dashboard',
    label: 'Manager Dashboard',
    icon: UserCheck,
    badge: 'Manager Signoff View',
    title: 'Streamlined Approval Operations & Reasoned Decisioning',
    description: 'Empowers Department Managers to inspect raw invoice documents side-by-side with AI-extracted metadata, mandatory fields clearance, and 1-click signoffs.',
    mockup: {
      metrics: [
        { label: 'Pending Manager Approval', val: '8 Tasks', sub: 'Action Required' },
        { label: 'Avg Signoff Response', val: '1.4 Hours', sub: '92% Same Day' },
        { label: 'Rejection Log Audit', val: '100%', sub: 'Mandatory Rationale Logged' },
      ],
      previewTitle: 'Manager Signoff Queue',
      items: [
        { inv: 'INV-2026-0088', vendor: 'Logistics Core Corp', amount: '₹3,12,000', usd: '$3,736', status: 'Action Needed' },
        { inv: 'INV-2026-0084', vendor: 'Vertex Cyber Security', amount: '₹6,40,000', usd: '$7,664', status: 'Approved' },
      ],
    },
  },
  {
    id: 'upload-invoice',
    label: 'Upload Invoice',
    icon: Upload,
    badge: 'Multimodal Ingestion',
    title: 'Drag & Drop File Staging with Hybrid AI Extraction',
    description: 'Supports PDF, PNG, and JPEG invoice uploads. Automatically runs client validation, Cloudinary CDN staging, Tesseract OCR, and Gemini 2.5 Vision fallback.',
    mockup: {
      metrics: [
        { label: 'Extraction Mode', val: 'Hybrid AI', sub: 'OCR + Gemini Vision' },
        { label: 'Confidence Score', val: '98.6%', sub: '20 Tokens Cleared' },
        { label: 'Missing Fields', val: '0 Mandatory', sub: 'Clean Staging Buffer' },
      ],
      previewTitle: 'Live Extraction Staging Buffer',
      items: [
        { inv: 'INV-2026-0092', vendor: 'Global Cargo Logistics', amount: '₹2,10,000', usd: '$2,514', status: 'Extracted' },
      ],
    },
  },
  {
    id: 'approval-queue',
    label: 'Approval Queue',
    icon: Clock,
    badge: 'Queue Isolation',
    title: 'Role-Isolated Queue Management & Rejection Modals',
    description: 'Filter invoices by status (Pending, Approved, Rejected). Managers open split-screen preview modals to approve or provide required rejection rationale.',
    mockup: {
      metrics: [
        { label: 'Queue Status', val: 'Active', sub: 'Isolated RBAC Guards' },
        { label: 'Currency View', val: 'INR / USD', sub: 'Live Rate Conversion' },
        { label: 'Audit Trail', val: 'Encrypted', sub: 'Full MongoDB History' },
      ],
      previewTitle: 'Approval Action Log',
      items: [
        { inv: 'INV-2026-0085', vendor: 'DevOps Cloud Solutions', amount: '₹1,95,000', usd: '$2,335', status: 'Rejected (PO Missing)' },
      ],
    },
  },
  {
    id: 'invoice-details',
    label: 'Invoice Details',
    icon: FileText,
    badge: 'Granular Inspection',
    title: 'Split-Screen Document Viewer & Master Ledger Details',
    description: 'Full inspection screen displaying high-resolution Cloudinary document viewer alongside header metadata, line item table, GST breakdown, and audit timeline.',
    mockup: {
      metrics: [
        { label: 'Document CDN', val: 'Cloudinary', sub: 'High Res Preview' },
        { label: 'Line Items', val: '6 Items', sub: 'Line Tax Parsed' },
        { label: 'Audit Hash', val: '0x94f...21a', sub: 'Tamper Proof Record' },
      ],
      previewTitle: 'Invoice Inspection View',
      items: [
        { inv: 'INV-2026-0089', vendor: 'Spectrum Tech Supplies', amount: '₹1,58,200', usd: '$1,894', status: 'Verified' },
      ],
    },
  },
]

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('finance-dashboard')

  const currentTab = showcaseTabs.find((t) => t.id === activeTab) || showcaseTabs[0]

  return (
    <section id="showcase" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[180px]" />

      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> INTERACTIVE PLATFORM SHOWCASE
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Explore the InvoiceFlow Application
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Dedicated role-isolated workspaces for Finance Executives, Department Managers, and Audit Teams.
        </p>
      </div>

      {/* SHOWCASE TABS SELECTOR */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
        {showcaseTabs.map((tab) => {
          const IconComp = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition border cursor-pointer focus:outline-none ${
                isActive
                  ? 'border-blue-500 bg-blue-600/20 text-white shadow-lg ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <IconComp className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* SHOWCASE TAB DISPLAY CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-800/90 bg-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl"
        >
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-mono font-bold text-blue-400 border border-blue-500/30">
                {currentTab.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                {currentTab.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl font-medium">
                {currentTab.description}
              </p>
            </div>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition shrink-0"
            >
              <span>Launch Live View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {currentTab.mockup.metrics.map((m, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  {m.label}
                </span>
                <p className="text-xl font-mono font-black text-white mt-1">
                  {m.val}
                </p>
                <span className="text-[11px] font-semibold text-blue-400 mt-0.5 block">
                  {m.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Preview Table Mockup */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {currentTab.mockup.previewTitle}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> Real-time Sync Active
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {currentTab.mockup.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">{item.inv}</span>
                      <span className="text-slate-400 text-[11px] font-sans">{item.vendor}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block">{item.amount}</span>
                    <span className="text-[10px] text-blue-400 font-mono">{item.usd} eqv</span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status.includes('Approved') || item.status.includes('Verified')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status.includes('Rejected')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
