import { usePageMeta } from '../../hooks/usePageMeta'
import CTASection from './home/CTASection'
import FaqPreviewSection from './home/FaqPreviewSection'
import HeroSection from './home/HeroSection'
import HowItWorksSection from './home/HowItWorksSection'
import ServicesSection from './home/ServicesSection'
import WhyChooseUsSection from './home/WhyChooseUsSection'

export default function Home() {
  usePageMeta()

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <FaqPreviewSection />
      <CTASection />
    </>
  )
}