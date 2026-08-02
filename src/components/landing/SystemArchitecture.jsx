import { motion } from 'framer-motion'
import {
  Code2,
  Network,
  Server,
  Cpu,
  Database,
  Brain,
  Cloud,
  ArrowDown,
} from 'lucide-react'

export function SystemArchitecture() {
  const pipelineSteps = [
    {
      title: 'React + Tailwind CSS',
      subtitle: 'Modern Component Frontend',
      description: 'Responsive user interface, interactive dashboards, and client-side RBAC rendering.',
      icon: Code2,
      badge: 'Client Layer',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Axios API Layer',
      subtitle: 'HTTP Request Pipeline',
      description: 'Secure JWT authenticated endpoints, interceptors, and error handling.',
      icon: Network,
      badge: 'Transport',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Node.js + Express',
      subtitle: 'REST Backend API Engine',
      description: 'Asynchronous event driven server handling validation, routes, and middleware.',
      icon: Server,
      badge: 'Core Server',
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      title: 'Business Logic & RBAC Engine',
      subtitle: 'Data Validation Guard',
      description: 'Role-based authorization, duplicate matching, and audit logging services.',
      icon: Cpu,
      badge: 'Logic Layer',
      gradient: 'from-violet-500 to-purple-600',
    },
  ]

  const serviceNodes = [
    {
      title: 'MongoDB',
      category: 'Database Service',
      description: 'Primary NoSQL database storing users, invoice ledgers, line items, and audit trails.',
      icon: Database,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'Mongoose ORM',
    },
    {
      title: 'Google Gemini AI',
      category: 'Multimodal AI Engine',
      description: 'Intelligent vision model parsing unstructured invoice PDFs/images into JSON schemas.',
      icon: Brain,
      gradient: 'from-indigo-500 to-violet-600',
      badge: 'Generative AI OCR',
    },
    {
      title: 'Cloudinary CDN',
      category: 'Media Cloud Storage',
      description: 'Secure cloud media storage for original invoice documents and thumbnail previews.',
      icon: Cloud,
      gradient: 'from-sky-500 to-blue-600',
      badge: 'Document CDN',
    },
  ]

  return (
    <section id="architecture" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-[150px]" />

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
          Technical Blueprint
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          System <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Architecture</span>
        </h2>
        <p className="text-base text-slate-300 leading-relaxed sm:text-lg">
          Built with a modern MERN stack and AI-powered document processing for high availability, security, and low latency.
        </p>
      </div>

      {/* PIPELINE CONTAINER */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PIPELINE NODES */}
        {pipelineSteps.map((step, idx) => {
          const IconComp = step.icon
          return (
            <div key={step.title} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="w-full group rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 sm:p-7 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="h-7 w-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h3>
                      <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                        {step.subtitle}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  {step.badge}
                </span>
              </motion.div>

              {/* Connecting Connector Line */}
              <div className="my-3 flex flex-col items-center">
                <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-indigo-500 animate-pulse" />
                <ArrowDown className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
          )
        })}

        {/* BRANCHING CONNECTORS HEADER */}
        <div className="text-center pt-4 pb-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300">
            Connected Cloud Services & Storage
          </span>
        </div>

        {/* BRANCHING SERVICE CARDS GRID */}
        <div className="grid gap-6 sm:grid-cols-3 pt-2">
          {serviceNodes.map((service, idx) => {
            const IconComp = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-3xl border border-slate-800/90 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                      {service.badge}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {service.title}
                  </h4>
                  <p className="mt-1 text-[11px] font-semibold text-indigo-400">
                    {service.category}
                  </p>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Active Connection
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
