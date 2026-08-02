export function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Background visual accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
      
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl sm:h-96 sm:w-96"></div>
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl sm:h-96 sm:w-96"></div>

      <div className="relative z-10 w-full px-4 py-12 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
