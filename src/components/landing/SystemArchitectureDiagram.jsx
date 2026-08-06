import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Server,
  ShieldCheck,
  Cloud,
  FileText,
  Cpu,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Database,
  Trash2,
  ArrowDown,
  ArrowRight,
  Sparkles,
  GitBranch,
  Layers,
  Clock,
  Search,
} from 'lucide-react'

export function SystemArchitectureDiagram() {
  const [activeBranch, setActiveBranch] = useState('high') // 'high' | 'low'
  const [activeAction, setActiveAction] = useState('save') // 'save' | 'cancel'

  return (
    <section id="architecture" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[180px]" />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-cyan-400 backdrop-blur-md">
          <GitBranch className="h-3.5 w-3.5" /> SYSTEM ARCHITECTURE & DATA PIPELINE
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Complete Invoice Processing Lifecycle
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Deterministic OCR pre-parsing, dynamic Gemini Vision fallback, multi-field normalization, duplicate risk engine, and transactional Cloudinary cleanup.
        </p>
      </div>

      {/* FLOWCHART CANVAS */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800/90 bg-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">

        {/* STAGE 1: INGESTION */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-slate-900/90 p-4 shadow-lg flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
              <Upload className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">Step 01 • Client Layer</span>
              <h3 className="text-base font-bold text-white">User Uploads Invoice</h3>
              <p className="text-xs text-slate-400">PDF, PNG, JPG format support via drag-and-drop or file selector</p>
            </div>
          </div>

          <div className="my-2 flex flex-col items-center">
            <div className="h-5 w-0.5 bg-blue-500/50" />
            <ArrowDown className="h-4 w-4 text-blue-400" />
          </div>

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
              <Server className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Step 02 • REST API</span>
              <h3 className="text-base font-bold text-white">Backend (Node.js + Express + Multer)</h3>
              <p className="text-xs text-slate-400">Memory storage buffer & multipart stream parser</p>
            </div>
          </div>

          <div className="my-2 flex flex-col items-center">
            <div className="h-5 w-0.5 bg-slate-700" />
            <ArrowDown className="h-4 w-4 text-slate-500" />
          </div>

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 text-center shadow-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Validation Guard</span>
            <p className="text-xs font-bold text-slate-200 mt-0.5">Validate File (PDF/JPG/PNG, Size Limit, Virus/MIME Check)</p>
          </div>

          <div className="my-2 flex flex-col items-center">
            <div className="h-5 w-0.5 bg-slate-700" />
            <ArrowDown className="h-4 w-4 text-slate-500" />
          </div>

          <div className="w-full max-w-md rounded-2xl border border-sky-500/30 bg-sky-950/30 p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-sky-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Upload Original → Cloudinary CDN</h4>
                <p className="text-[11px] text-sky-300 font-mono">Store Secure URL + public_id</p>
              </div>
            </div>
            <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-300 border border-sky-500/30">
              CDN Ready
            </span>
          </div>

          <div className="my-2 flex flex-col items-center">
            <div className="h-5 w-0.5 bg-slate-700" />
            <ArrowDown className="h-4 w-4 text-slate-500" />
          </div>

          {/* OCR STAGE */}
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4 shadow-lg flex items-center gap-4">
            <Cpu className="h-6 w-6 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">OCR Engine Stage</span>
              <h4 className="text-xs font-bold text-white">OCR (Tesseract.js on Original Invoice Document)</h4>
              <p className="text-[11px] text-slate-400">Extract Raw Text + Word Confidence Array</p>
            </div>
          </div>

          <div className="my-2 flex flex-col items-center">
            <div className="h-5 w-0.5 bg-purple-500/50" />
            <ArrowDown className="h-4 w-4 text-purple-400" />
          </div>

          {/* RULE ENGINE BOX */}
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Backend Validation & Quality Rule Engine
              </span>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                Rule Check
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Required fields present?
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> OCR confidence threshold?
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Document readable?
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Line item table structure?
              </div>
            </div>
          </div>
        </div>

        {/* DECISION SPLIT BRANCH: HIGH VS LOW CONFIDENCE */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-xs font-mono font-bold text-purple-300">
              <GitBranch className="h-3.5 w-3.5" /> Extraction Strategy Evaluation Decision
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* HIGH CONFIDENCE BRANCH */}
            <div
              onClick={() => setActiveBranch('high')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                activeBranch === 'high'
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-xl ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  High Confidence (≥90% + Mandatory Fields)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Branch A</span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Parse Using Backend Engine</h4>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Local Regex pattern matching, Regex field mapping, zero external API token cost.
              </p>
            </div>

            {/* LOW CONFIDENCE BRANCH */}
            <div
              onClick={() => setActiveBranch('low')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                activeBranch === 'low'
                  ? 'border-violet-500 bg-violet-950/20 shadow-xl ring-1 ring-violet-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-mono font-bold text-violet-400 border border-violet-500/30">
                  Low Confidence (&lt;90% or Missing Fields)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Branch B</span>
              </div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-violet-400" /> Gemini 2.5 Flash Vision
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Multimodal AI vision model parses complex, skewed, or unreadable document images directly.
              </p>
            </div>
          </div>
        </div>

        {/* MERGE POINT: STRUCTURED INVOICE JSON */}
        <div className="flex flex-col items-center pt-4">
          <div className="h-6 w-0.5 bg-gradient-to-b from-purple-500 to-cyan-500" />
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 text-center shadow-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Unified Standard</span>
            <h4 className="text-sm font-black text-white mt-0.5">Structured Invoice JSON Object</h4>
          </div>
          <div className="h-5 w-0.5 bg-cyan-500/50" />
          <ArrowDown className="h-4 w-4 text-cyan-400" />
        </div>

        {/* STAGE 2: VALIDATION & NORMALIZATION BOX */}
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> Backend Validation & Normalization Engine
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div>• Date Standardization (ISO 8601)</div>
            <div>• Amount & Tax Parsing (Float)</div>
            <div>• GSTIN Regex Validation</div>
            <div>• Currency Normalization (INR/USD)</div>
            <div className="col-span-2 text-amber-400">• Compute missing mandatory/optional arrays</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-5 w-0.5 bg-slate-700" />
          <ArrowDown className="h-4 w-4 text-slate-500" />
        </div>

        {/* STAGE 3: DUPLICATE DETECTION ENGINE */}
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-950 pb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Search className="h-4 w-4" /> Real-time Duplicate Detection Engine
            </span>
            <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">
              Risk Check
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div>• Vendor Name + Invoice No</div>
            <div>• Total Invoice Amount</div>
            <div>• Issue Date</div>
            <div>• Existing Record Hash Match</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-5 w-0.5 bg-slate-700" />
          <ArrowDown className="h-4 w-4 text-slate-500" />
        </div>

        {/* STAGE 4: EXTRACTION REPORT GENERATOR */}
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-cyan-400" /> Generate Extraction Metadata & Audit Report
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
            <div>• Extraction Source (OCR vs Gemini)</div>
            <div>• OCR Confidence Score (%)</div>
            <div>• Duplicate Risk Flag (Bool)</div>
            <div>• Validation Error Badges</div>
            <div className="col-span-2 text-cyan-400">• Total Processing Duration (ms)</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-5 w-0.5 bg-slate-700" />
          <ArrowDown className="h-4 w-4 text-slate-500" />
        </div>

        {/* STAGE 5: DISPLAY TO USER & TRANSACTIONAL ACTION BRANCH */}
        <div className="w-full max-w-md mx-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 text-center shadow-lg">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Staging Review UI</span>
          <h4 className="text-sm font-extrabold text-white mt-0.5">Show Extracted Data & Original Document to User</h4>
        </div>

        {/* USER SAVE VS CANCEL DECISION BRANCH */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-xs font-mono font-bold text-slate-300">
              User Decision Execution Branch
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SAVE ACTION BRANCH */}
            <div
              onClick={() => setActiveAction('save')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                activeAction === 'save'
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-xl ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> User Clicks Save
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-400" /> Save Record to MongoDB Collection
                </div>
                <div className="text-emerald-400 font-bold">
                  → Success Response (HTTP 201 Created)
                </div>
              </div>
            </div>

            {/* CANCEL ACTION BRANCH */}
            <div
              onClick={() => setActiveAction('cancel')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                activeAction === 'cancel'
                  ? 'border-rose-500 bg-rose-950/20 shadow-xl ring-1 ring-rose-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> User Clicks Cancel
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-rose-400" /> Delete Original File from Cloudinary CDN
                </div>
                <div className="text-rose-400 font-bold">
                  → Discard Extraction Staging & Exit
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
