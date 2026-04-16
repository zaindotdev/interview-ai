'use client'

import React from 'react'
import { motion } from "motion/react";
import {PricingCard} from '../shared/pricing-card';
import { PLANS } from '@/lib/subscription-plans';
import { useSession } from "next-auth/react";

const PricingSections = () => {
    const { data: session } = useSession();

    const pricingPlans = [
        {
          title: PLANS.FREE.name,
          description: "Perfect for individuals getting started with interview preparation.",
          price: "$0/mo",
          features: PLANS.FREE.features.slice(),
          buttonText: session ? "Go to Dashboard" : "Get Started Free",
          buttonLink: session ? "/dashboard" : "/sign-up",
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
          buttonLink: session ? "/dashboard" : "/sign-up",
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
          buttonLink: session ? "/dashboard" : "/sign-up",
          tier: "pro" as const,
          badge: "Best Value",
          planKey: "PREMIUM" as const,
          productId: PLANS.PREMIUM.productId,
        }
      ];
  return (
    <section id='pricing' className="mx-auto max-w-7xl px-4 py-20 mb-20">
        {/* Heading */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="font-lighter text-center text-xl tracking-wide uppercase"
            >
                Pricing Plans
            </motion.h3>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.1,
                }}
                className="mt-2 text-center text-3xl font-bold"
            >
                Simple, Transparent Pricing
            </motion.h2>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-stretch justify-center gap-8"
        >
            {pricingPlans.map((plan) => (
                <PricingCard
                    key={plan.planKey}
                    {...plan}
                />
            ))}
        </motion.div>
    </section>  
  )
}

export default PricingSections