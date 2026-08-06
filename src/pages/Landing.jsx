import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { StatsSection } from '../components/landing/StatsSection'
import { HowInvoiceFlowWorks } from '../components/landing/HowInvoiceFlowWorks'
import { WhyInvoiceFlow } from '../components/landing/WhyInvoiceFlow'
import { SystemArchitectureDiagram } from '../components/landing/SystemArchitectureDiagram'
import { DashboardShowcase } from '../components/landing/DashboardShowcase'
import { AiCapabilities } from '../components/landing/AiCapabilities'
import { SecuritySection } from '../components/landing/SecuritySection'
import { TechStackSection } from '../components/landing/TechStackSection'
import { FaqSection } from '../components/landing/FaqSection'
import Footer from '../components/landing/Footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 01. Sticky Navbar */}
      <Navbar />

      <main className="overflow-hidden space-y-4">
        {/* 02. Hero Section */}
        <HeroSection />

        {/* 03. Animated Statistics */}
        <StatsSection />

        {/* 04. How InvoiceFlow Works (Visual Workflow) */}
        <HowInvoiceFlowWorks />

        {/* 05. Why InvoiceFlow (Feature Cards Grid) */}
        <WhyInvoiceFlow />

        {/* 06. Interactive System Architecture Flow Diagram */}
        <SystemArchitectureDiagram />

        {/* 07. Dashboard Showcase (Interactive Application Views) */}
        <DashboardShowcase />

        {/* 08. AI Capabilities */}
        <AiCapabilities />

        {/* 09. Security & Compliance */}
        <SecuritySection />

        {/* 10. Tech Stack Badges */}
        <TechStackSection />

        {/* 11. FAQ Accordion */}
        <FaqSection />
      </main>

      {/* 12. Premium Footer */}
      <Footer />
    </div>
  )
}
