import { Link } from 'react-router-dom'
import { Github, ArrowRight } from 'lucide-react'
import { Logo } from '../common/Logo'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Showcase', href: '#showcase' },
  { label: 'About', href: '#about' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group">
          <Logo className="h-9 w-9" showText={true} />
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href === '#architecture') {
                  window.dispatchEvent(new Event('open-architecture'))
                }
              }}
              className="text-xs font-bold text-slate-300 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Jeelkathiria/invoiceflow"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:border-blue-500 hover:text-white transition"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <Link
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-slate-700 hover:text-white"
            to="/login"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-5.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-95 border border-blue-400/30"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </header>
  )
}
