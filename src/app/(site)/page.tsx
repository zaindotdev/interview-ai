import FAQs from '@/components/home/faqs'
import Hero from '@/components/home/hero'
import HowItWorks from '@/components/home/how-it-works'
import WhatYouGetSection from '@/components/home/what-you-get'
import PricingSections from "@/components/home/pricings"
import CTA from '@/components/home/CTA'

const Home = () => {
  return (
    <main className="mx-auto max-w-7xl px-6 md:px-8">
      <Hero/>
      <WhatYouGetSection/>
      <HowItWorks/>
      <FAQs/>
      <PricingSections />
      <CTA/>
    </main>
  )
}

export default Home