import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Database,
  Globe,
  BarChart3,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'

const flowNodes = [
  {
    id: 'ingest',
    number: '01',
    layer: 'Phase 01',
    title: 'INGEST & SCAN',
    subtitle: 'Multimodal Document Ingestion',
    colorName: 'cyan',
    accentColor: '#0ea5e9',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    gradientLine: 'from-cyan-500 to-purple-500',
    icon: Upload,
    bullets: [
      'PDF, PNG, JPEG Multi-Format Support',
      'Client-Side Magic Byte Validation',
      'Drag & Drop Staging Canvas',
      'Cloudinary Document CDN Storage',
    ],
    specs: {
      latency: '< 150ms',
      throughput: '100+ files/min',
      security: 'JWT Authenticated Staging',
      protocol: 'HTTPS / Multipart Form',
    },
  },
  {
    id: 'process',
    number: '02',
    layer: 'Phase 02',
    title: 'HYBRID AI PARSER',
    subtitle: 'OCR + Gemini 2.5 Vision Engine',
    colorName: 'purple',
    accentColor: '#a855f7',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    gradientLine: 'from-purple-500 to-amber-500',
    icon: Cpu,
    bullets: [
      'Tesseract OCR Local Pre-Parser',
      'Google Gemini 2.5 Flash Vision Fallback',
      '4 Mandatory + 16 Extended Fields',
      'Missing Mandatory Field Detector',
    ],
    specs: {
      accuracy: '99.4% OCR Precision',
      model: 'Gemini 2.5 Flash Vision',
      fieldCoverage: '20 Extraction Tokens',
      confidenceRule: '90% Quality Floor',
    },
  },
  {
    id: 'audit',
    number: '03',
    layer: 'Phase 03',
    title: 'AUDIT & CURRENCY',
    subtitle: 'Duplicate Risk & Multi-Currency',
    colorName: 'amber',
    accentColor: '#eab308',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    gradientLine: 'from-amber-500 to-emerald-500',
    icon: ShieldCheck,
    bullets: [
      'Multi-Attribute Duplicate Matching',
      'INR (₹), USD ($), EUR (€), GBP (£)',
      'Live Exchange Equivalence Engine',
      'Draft Record Verification Guard',
    ],
    specs: {
      rates: 'Live USD/INR (1 USD = ₹83.50)',
      riskCheck: 'GSTIN + Inv # + Amount',
      storage: 'MongoDB Mongoose Schema',
      validation: 'Fail-Safe Defensive Payload',
    },
  },
  {
    id: 'signoff',
    number: '04',
    layer: 'Phase 04',
    title: 'SIGNOFF & ANALYTICS',
    subtitle: 'Manager Signoff & Recharts Sync',
    colorName: 'emerald',
    accentColor: '#22c55e',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    gradientLine: 'from-emerald-500 to-emerald-400',
    icon: CheckCircle2,
    bullets: [
      'Manager Split-Screen Preview Modal',
      '1-Click Approval / Reasoned Rejection',
      'Mandatory Rejection Rationale Log',
      'Shadcn Vector Recharts Analytics',
    ],
    specs: {
      rbac: 'Finance Exec vs Manager Guards',
      auditTrail: 'Timestamped User Activity',
      analytics: 'Spline, Stacked Bar, Donut',
      export: '1-Click CSV Ledger Download',
    },
  },
]

export function FlowchartArchitecture() {
  const [activeStage, setActiveStage] = useState('ingest')

  const currentStageData = flowNodes.find((n) => n.id === activeStage) || flowNodes[0]

  return (
    <section id="flowchart" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-[160px]" />

      {/* Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
          <Layers className="h-3.5 w-3.5 text-cyan-400" /> Interactive Flow Architecture
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          End-to-End <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">System Flowchart</span>
        </h2>
        <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
          Click any node below to inspect real-time data pipelines, AI validation guards, and technical execution specs.
        </p>
      </div>

      {/* FLOWCHART INTERACTIVE CONTAINER */}
      <div className="space-y-12">
        {/* HORIZONTAL NODE PIPELINE (DESKTOP) */}
        <div className="hidden lg:grid grid-cols-4 gap-4 relative items-start">
          {flowNodes.map((node, idx) => {
            const IconComp = node.icon
            const isActive = activeStage === node.id

            return (
              <div key={node.id} className="relative flex flex-col items-center">
                {/* CONNECTING GRADIENT LINE WITH ARROW (Between Nodes) */}
                {idx < flowNodes.length - 1 && (
                  <div className="absolute top-8 left-[60%] w-[80%] h-0.5 z-0 pointer-events-none flex items-center justify-center">
                    <div className={`w-full h-full bg-gradient-to-r ${node.gradientLine} opacity-60`} />
                    <div
                      className="absolute right-0 translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-md"
                      style={{ color: flowNodes[idx + 1].accentColor }}
                    >
                      <ArrowRight className="h-3 w-3 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* NODE ICON CONTAINER (Target Box Corner Style) */}
                <button
                  onClick={() => setActiveStage(node.id)}
                  className={`relative z-10 group flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none`}
                >
                  {/* Square Box with Corner Brackets */}
                  <div
                    className={`target-box-corners flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 border transition-all duration-300 shadow-xl ${
                      isActive
                        ? `${node.borderColor} shadow-2xl scale-110 ring-2 ring-offset-2 ring-offset-slate-950`
                        : 'border-slate-800 hover:border-slate-600 hover:scale-105'
                    }`}
                    style={{
                      borderColor: isActive ? node.accentColor : undefined,
                      boxShadow: isActive ? `0 0 25px ${node.accentColor}33` : undefined,
                    }}
                  >
                    <IconComp
                      className={`h-7 w-7 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                      style={{ color: node.accentColor }}
                    />
                  </div>

                  {/* Monospace Badge & Title */}
                  <div className="mt-3 text-center space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 block">
                      {node.layer}
                    </span>
                    <h3
                      className={`text-sm font-black tracking-tight uppercase transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {node.title}
                    </h3>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* MOBILE / TABLET NODE SELECTOR PILLS */}
        <div className="flex lg:hidden flex-wrap items-center justify-center gap-2">
          {flowNodes.map((node) => {
            const IconComp = node.icon
            const isActive = activeStage === node.id
            return (
              <button
                key={node.id}
                onClick={() => setActiveStage(node.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                  isActive
                    ? `${node.borderColor} ${node.bgColor} text-white shadow-lg`
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComp className="h-4 w-4" style={{ color: node.accentColor }} />
                <span>{node.title}</span>
              </button>
            )
          })}
        </div>

        {/* NODE CARDS GRID FOR ALL 4 STAGES */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flowNodes.map((node) => {
            const isActive = activeStage === node.id
            return (
              <motion.div
                key={node.id}
                onClick={() => setActiveStage(node.id)}
                whileHover={{ y: -5 }}
                className={`cursor-pointer group rounded-3xl border bg-slate-900/90 p-6 backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col justify-between ${
                  isActive
                    ? `${node.borderColor} ring-1`
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
                style={{
                  borderColor: isActive ? node.accentColor : undefined,
                  boxShadow: isActive ? `0 10px 30px -10px ${node.accentColor}25` : undefined,
                }}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${node.accentColor}18`,
                        color: node.accentColor,
                        border: `1px solid ${node.accentColor}40`,
                      }}
                    >
                      {node.number} • {node.layer}
                    </span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.accentColor }} />
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {node.title}
                  </h4>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">
                    {node.subtitle}
                  </p>

                  {/* Bullet Spec List with Colored Square Badges */}
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    {node.bullets.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs text-[9px] font-mono font-bold text-slate-950 mt-0.5"
                          style={{ backgroundColor: node.accentColor }}
                        >
                          {idx + 1}
                        </span>
                        <span className="leading-snug text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold" style={{ color: node.accentColor }}>
                  <span>Inspect Spec</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ACTIVE STAGE DETAILED TECHNICAL SPECS TERMINAL PANEL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStageData.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: `${currentStageData.accentColor}15` }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-mono font-bold text-slate-950 shadow-md"
                  style={{ backgroundColor: currentStageData.accentColor }}
                >
                  {currentStageData.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {currentStageData.title} Specifications
                    </h3>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: `${currentStageData.accentColor}20`,
                        color: currentStageData.accentColor,
                      }}
                    >
                      LIVE SPECS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentStageData.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Pipeline Node</span>
              </div>
            </div>

            {/* SPECS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(currentStageData.specs).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <p className="mt-1 text-sm font-extrabold text-white font-mono">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
