import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  Upload,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCheck,
  RefreshCw,
} from 'lucide-react'

const showcaseTabs = [
  {
    id: 'finance-dashboard',
    label: 'Finance Dashboard',
    icon: LayoutDashboard,
    badge: 'Finance Executive View',
    title: 'Personal Isolated Ledger & Real-Time Spend Overview',
    description: 'Finance Executives manage their personal invoice submissions with OCR + Gemini 2.5 Vision dual extraction, duplicate risk detection, and multi-currency spend tracking.',
    mockup: {
      metrics: [
        { label: 'My Total Processed', val: '42 Invoices', sub: '₹48.60 Lakh ($58.2k eqv)' },
        { label: 'Pending Manager Signoff', val: '3 Invoices', sub: 'Awaiting Authorization' },
        { label: 'Payment Queue Stage', val: '12 Invoices', sub: 'Approved & Staged' },
      ],
      previewTitle: 'Personal Executive Submissions',
      items: [
        { inv: 'INV-2026-0089', vendor: 'Spectrum Tech Supplies', amount: '₹1,58,200', usd: '$1,894', status: 'Payment Queue' },
        { inv: 'INV-2026-0090', vendor: 'CloudScale Systems', amount: '₹4,25,000', usd: '$5,089', status: 'Pending Approval' },
        { inv: 'INV-2026-0091', vendor: 'Apex Office Solutions', amount: '₹84,500', usd: '$1,012', status: 'Paid (Settled)' },
      ],
    },
  },
  {
    id: 'manager-dashboard',
    label: 'Manager Dashboard',
    icon: UserCheck,
    badge: 'Manager Control Center',
    title: 'Organization-Wide Approval & Audit Control',
    description: 'Managers oversee all finance executive submissions, inspect raw documents side-by-side with AI extraction metadata, monitor risk indicators, and execute signoffs.',
    mockup: {
      metrics: [
        { label: 'Pending Approvals', val: '8 Tasks', sub: 'Needs Manager Action' },
        { label: 'Risk Indicators', val: '2 Duplicates', sub: 'High Value Flagged' },
        { label: 'Org Payment Queue', val: '₹62.40 Lakh', sub: 'Finance Disbursing' },
      ],
      previewTitle: 'Organization Approval Queue',
      items: [
        { inv: 'INV-2026-0088', vendor: 'Logistics Core Corp', amount: '₹3,12,000', usd: '$3,736', status: 'Pending Approval' },
        { inv: 'INV-2026-0084', vendor: 'Vertex Cyber Security', amount: '₹6,40,000', usd: '$7,664', status: 'Approved' },
        { inv: 'INV-2026-0082', vendor: 'Global Telecom Ltd', amount: '₹1,95,000', usd: '$2,335', status: 'Needs Correction' },
      ],
    },
  },
  {
    id: 'finance-team',
    label: 'Finance Team',
    icon: Users,
    badge: 'Manager-Only Module',
    title: 'Executive Performance Analytics & Granular Member Drill-Down',
    description: 'Dedicated manager view to search executives, review total invoice values, inspect status distribution donut charts, and monitor individual monthly spending trends.',
    mockup: {
      metrics: [
        { label: 'Finance Executives', val: '6 Members', sub: 'Searchable Directory' },
        { label: 'Top Performer', val: 'Rajesh Sharma', sub: '18 Invoices Processed' },
        { label: 'Granular Analytics', val: '100% Isolated', sub: 'Individual Spend Logs' },
      ],
      previewTitle: 'Finance Executive Directory & Workload',
      items: [
        { inv: 'Rajesh Sharma', vendor: 'rajesh@invoiceflow.io', amount: '₹18,50,000', usd: '18 Invoices', status: 'View Details →' },
        { inv: 'Priya Patel', vendor: 'priya@invoiceflow.io', amount: '₹14,20,000', usd: '14 Invoices', status: 'View Details →' },
        { inv: 'Amit Kumar', vendor: 'amit@invoiceflow.io', amount: '₹9,80,000', usd: '10 Invoices', status: 'View Details →' },
      ],
    },
  },
  {
    id: 'payment-queue',
    label: 'Payment Queue',
    icon: CreditCard,
    badge: 'Disbursement Stage',
    title: 'Post-Approval Payment Queue & 1-Click Settlement',
    description: 'Approved invoices move automatically to the Payment Queue. Track due dates (Due Soon, Overdue), attach transaction reference numbers, and mark invoices as Paid.',
    mockup: {
      metrics: [
        { label: 'Queue Balance', val: '₹28.90 Lakh', sub: 'Staged for Disbursement' },
        { label: 'Overdue Alerts', val: '2 Invoices', sub: 'Action Recommended' },
        { label: 'Settlement Proof', val: 'Mandatory Tx ID', sub: 'Complete Audit Trail' },
      ],
      previewTitle: 'Disbursement Queue Ledger',
      items: [
        { inv: 'INV-2026-0089', vendor: 'Spectrum Tech Supplies', amount: '₹1,58,200', usd: 'Due in 3 Days', status: 'Mark as Paid' },
        { inv: 'INV-2026-0074', vendor: 'FastTrack Logistics', amount: '₹92,000', usd: 'OVERDUE (2 Days)', status: 'Mark as Paid' },
        { inv: 'INV-2026-0062', vendor: 'Metro Energy Services', amount: '₹3,40,000', usd: 'Tx Ref #984210', status: 'Paid (Settled)' },
      ],
    },
  },
  {
    id: 'fix-resubmit',
    label: 'Fix & Resubmit',
    icon: RefreshCw,
    badge: 'Rejection Workflow',
    title: 'Structured Rejection Rationale & Version-Controlled Resubmission',
    description: 'When a Manager rejects an invoice with a mandatory reason, Finance Executives receive real-time notifications, fix fields on split-screen UI, and resubmit with full diff logging.',
    mockup: {
      metrics: [
        { label: 'Rejection Reason', val: 'Mandatory', sub: 'Clear Manager Guidance' },
        { label: 'Correction Mode', val: 'Split-Screen', sub: 'Original PDF Side-by-Side' },
        { label: 'Audit Diff Log', val: 'Versioned', sub: 'Tracks Field Edits' },
      ],
      previewTitle: 'Correction & Resubmission Log',
      items: [
        { inv: 'INV-2026-0085', vendor: 'DevOps Cloud Solutions', amount: '₹1,95,000', usd: 'Reason: PO Missing', status: 'Needs Correction' },
        { inv: 'INV-2026-0085-R1', vendor: 'DevOps Cloud Solutions (Fixed)', amount: '₹1,95,000', usd: 'PO-99421 Attached', status: 'Resubmitted' },
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
          Explore the InvoiceFlow Platform
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Dedicated role-isolated workspaces for Finance Executives, Managers, Payment Officers, and Team Leads.
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
                    <span className="text-[10px] text-blue-400 font-mono">{item.usd}</span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status.includes('Approved') || item.status.includes('Paid') || item.status.includes('Details')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status.includes('Correction') || item.status.includes('Rejected')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
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

export default DashboardShowcase
