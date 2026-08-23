import { Github, ExternalLink, ShieldCheck, Sparkles, Server } from 'lucide-react'
import { Logo } from '../common/Logo'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Main Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <Logo className="h-10 w-10" showText={true} />
            <p className="text-xs font-semibold text-indigo-300">
              AI-Powered Multimodal Invoice Lifecycle Platform
            </p>
            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              InvoiceFlow automates the accounts payable pipeline—from Gemini AI document parsing and duplicate detection to role-based finance reviews and manager approvals.
            </p>

            <div className="pt-2">
              <a
                href="https://github.com/Jeelkathiria/invoiceflow"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500 transition shadow-sm"
              >
                <Github className="h-4 w-4" />
                <span>View Project Source Code on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Core Capabilities</p>
            <ul className="mt-5 space-y-2.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-indigo-400" /> AI Document Extraction</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Duplicate Risk Prevention</li>
              <li className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-cyan-400" /> Role-Based Access (RBAC)</li>
              <li>Approval Queue Workflow</li>
              <li>Live Financial Analytics</li>
              <li>Audit Trail History</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tech Stack</p>
            <ul className="mt-5 space-y-2.5 text-xs text-slate-300 font-medium">
              <li>React 19 + Tailwind CSS</li>
              <li>Node.js + Express REST API</li>
              <li>MongoDB & Mongoose</li>
              <li>Google Gemini AI Vision</li>
              <li>Cloudinary Document CDN</li>
              <li>Framer Motion Animations</li>
            </ul>
          </div>

          {/* Project Repository & Links */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Project Links</p>
            <ul className="mt-5 space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <a
                  href="https://github.com/Jeelkathiria/invoiceflow"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 font-bold hover:underline"
                >
                  GitHub Repository <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li><a href="/app/dashboard" className="hover:text-white transition">Finance Dashboard</a></li>
              <li><a href="/app/upload-invoice" className="hover:text-white transition">Upload Ingestion</a></li>
              <li><a href="/app/approval-queue" className="hover:text-white transition">Approval Queue</a></li>
              <li><a href="/app/all-invoices" className="hover:text-white transition">Master Ledger</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © 2026 InvoiceFlow Engine • Open Source Enterprise Finance Automation
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Jeelkathiria/invoiceflow"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-bold text-slate-300 hover:border-indigo-500 hover:text-white transition"
            >
              <Github className="h-4 w-4 text-indigo-400" />
              <span>Jeelkathiria/invoiceflow</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
