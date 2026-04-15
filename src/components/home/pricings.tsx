'use client'

import React from 'react'
import { motion } from "motion/react";
import {PricingCard} from '../shared/pricing-card';
import { PLANS } from '@/lib/subscription-plans';

const PricingSections = () => {
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
            <PricingCard
                planType="Free"
                description={PLANS.FREE.description}
                price={String(PLANS.FREE.price)}
                features={PLANS.FREE.features}
                buttonUrl="/sign-up?plan=free"
            />
            <PricingCard
                planType="Pro"
                description={PLANS.PRO.description}
                price={String(PLANS.PRO.price)}
                features={PLANS.PRO.features}
                buttonUrl="/sign-up?plan=pro"
            />
        </motion.div>
    </section>  
  )
}

export default PricingSections