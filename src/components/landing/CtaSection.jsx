export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-brand-500/20 bg-gradient-to-br from-slate-950/90 to-slate-900/95 p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Ready to simplify invoice processing?</p>
        <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Start your AI-driven invoice workflow today.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">InvoiceFlow gives your finance team the clarity, speed, and audit-ready trust they need.</p>
        <a href="/signup" className="mt-8 inline-flex rounded-3xl bg-brand-500 px-8 py-4 text-sm font-semibold text-slate-950 transition hover:bg-brand-400">
          Start Free
        </a>
      </div>
    </section>
  )
}
