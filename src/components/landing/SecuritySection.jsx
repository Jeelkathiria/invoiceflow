import { motion } from 'framer-motion'
import {
  Key,
  ShieldCheck,
  Cloud,
  Clock,
  Lock,
  Sparkles,
} from 'lucide-react'

const securityCards = [
  {
    title: 'JWT Authentication',
    subtitle: 'Secure Token Sessions',
    icon: Key,
    description: 'Stateless JSON Web Tokens with encrypted signature verification and session expiry controls.',
    badge: 'Auth Security',
  },
  {
    title: 'Role Based Access (RBAC)',
    subtitle: 'Finance Exec vs Manager Guards',
    icon: ShieldCheck,
    description: 'Strict route and controller guards isolate upload & staging actions from manager approval signoffs.',
    badge: 'Role Isolation',
  },
  {
    title: 'Secure Cloud Storage',
    subtitle: 'Cloudinary CDN Encryption',
    icon: Cloud,
    description: 'Documents are uploaded via secure HTTPS TLS 1.3 endpoints to Cloudinary CDN with transactional cleanup.',
    badge: 'CDN Encryption',
  },
  {
    title: 'Audit Trail',
    subtitle: 'Timestamped Event History',
    icon: Clock,
    description: 'Every invoice status change, approval signoff, and rejection reason is logged with user IDs & timestamps.',
    badge: 'Immutable History',
  },
  {
    title: 'Data Validation',
    subtitle: 'Sanitized Mongoose Schemas',
    icon: Lock,
    description: 'Defensive payload sanitization, type safety guards, and strict Mongoose schema enforcement.',
    badge: 'Payload Guard',
  },
]

export function SecuritySection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/5 blur-[160px]" />

      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-emerald-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> ENTERPRISE SECURITY & COMPLIANCE
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Bank-Grade Security Architecture
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Zero-trust data isolation, encrypted token authentication, and full audit logging for enterprise finance compliance.
        </p>
      </div>

      {/* 5 CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {securityCards.map((sec, idx) => {
          const IconComp = sec.icon
          return (
            <motion.div
              key={sec.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <IconComp className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="rounded-md bg-slate-950 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 border border-slate-800">
                    {sec.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {sec.subtitle}
                </p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {sec.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
