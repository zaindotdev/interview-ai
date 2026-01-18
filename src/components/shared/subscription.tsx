'use client'

import React from "react";
import { useSession } from "next-auth/react";
import { PLANS } from "@/lib/subscription-plans";
import PricingCard from "./pricing-card";
import { motion } from "framer-motion";
import HeadingContainer from "./heading-container";

interface SubscriptionSectionProps {
  showHeader?: boolean;
}

export default function SubscriptionSection({ showHeader = true }: SubscriptionSectionProps) {
  const { data: session } = useSession();

  // Convert PLANS to PricingCard format with proper plan keys and product IDs
  const pricingPlans = [
    {
      title: PLANS.FREE.name,
      description: "Perfect for individuals getting started with interview preparation.",
      price: "$0/mo",
      features: PLANS.FREE.features.slice(),
      buttonText: session ? "Go to Dashboard" : "Get Started Free",
      buttonLink: session ? "/dashboard" : "/sign-up?plan=free",
      tier: "basic" as const,
      planKey: "FREE" as const,
      productId: PLANS.FREE.productId,
    },
    {
      title: PLANS.PRO.name,
      description: "Ideal for serious job seekers who want unlimited practice.",
      price: `$${PLANS.PRO.price}/mo`,
      features: PLANS.PRO.features.slice(),
      buttonText: session ? "Upgrade to Pro" : "Start Pro Trial",
      buttonLink: session ? "/dashboard" : "/sign-up?plan=pro",
      tier: "pro" as const,
      popular: true,
      planKey: "PRO" as const,
      productId: PLANS.PRO.productId,
    },
    {
      title: PLANS.PREMIUM.name,
      description: "For professionals seeking comprehensive career support.",
      price: `$${PLANS.PREMIUM.price}/mo`,
      features: PLANS.PREMIUM.features.slice(),
      buttonText: session ? "Upgrade to Premium" : "Start Premium",
      buttonLink: session ? "/dashboard" : "/sign-up?plan=premium",
      tier: "pro" as const,
      badge: "Best Value",
      planKey: "PREMIUM" as const,
      productId: PLANS.PREMIUM.productId,
    }
  ];

  return (
    <section id="pricing" className="w-full py-24">
      {showHeader && (
        <HeadingContainer>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, ease: "linear" }} 
            className="text-center text-orange-600 font-medium text-base/8 md:text-lg/8"
          >
            Pricing
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} 
            className="text-2xl/8 md:text-5xl text-center font-semibold mt-4"
          >
            Choose the plan that works best for you
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} 
            className="mt-6 text-base md:text-xl/8 text-center font-medium text-gray-600"
          >
            Looking to take your interview skills to the next level? Our platform offers comprehensive tools tailored
            for success. Experience AI-powered practice sessions with industry-specific questions, get instant feedback,
            and monitor your growth with detailed performance analytics.
          </motion.p>
        </HeadingContainer>
      )}
      
      <div className="max-w-7xl mx-auto flex items-stretch justify-center flex-wrap lg:flex-nowrap gap-6 mt-8">
        {pricingPlans.map((plan, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: index * 0.2, ease: "linear" }} 
            key={`pricing-${index}`} 
            className="w-full lg:w-1/3 flex"
          >
            <PricingCard {...plan} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.8, delay: 0.6 }} 
        className="mt-16 text-center"
      >
        <p className="text-gray-600">
          All plans include secure payment processing and can be cancelled anytime.
        </p>
      </motion.div>
    </section>
  );
}
