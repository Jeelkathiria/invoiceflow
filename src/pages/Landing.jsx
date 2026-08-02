import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { HowItWorks } from '../components/landing/HowItWorks'
import { FeatureGrid } from '../components/landing/FeatureGrid'
import { SystemArchitecture } from '../components/landing/SystemArchitecture'
import { EnterpriseComparison } from '../components/landing/EnterpriseComparison'
import { CtaSection } from '../components/landing/CtaSection'
import Footer from '../components/landing/Footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <HowItWorks />
        <FeatureGrid />
        <SystemArchitecture />
        <EnterpriseComparison />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
