import { Link } from 'react-router-dom'
import { FileText, Github } from 'lucide-react'

const navItems = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Comparison', href: '#comparison' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-extrabold text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black shadow-md">
            <FileText className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="tracking-tight">Invoice<span className="text-indigo-400">Flow</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-xs font-bold text-slate-300 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Jeelkathiria/invoiceflow"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:border-indigo-500 hover:text-white transition"
          >
            <Github className="h-3.5 w-3.5 text-slate-300" />
            <span>GitHub</span>
          </a>
          <Link className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-bold text-slate-200 transition hover:border-indigo-500 hover:text-white" to="/login">
            Login
          </Link>
          <Link className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-1.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-95" to="/signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
