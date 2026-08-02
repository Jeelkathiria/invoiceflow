const companies = ['Oracle', 'Visa', 'Stripe', 'Airbnb', 'Shopify']

export function TrustedCompanies() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Trusted by modern finance teams</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {companies.map((company) => (
            <div key={company} className="flex h-16 items-center justify-center rounded-3xl bg-slate-900/80 text-slate-300 shadow-inner">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
