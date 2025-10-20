export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: "", // No Stripe price ID for free
    features: [
      "5 mock interviews per month",
      "Basic feedback",
      "Limited question bank"
    ],
    limits: {
      mockInterviews: 5,
      resumeAnalysis: 2,
    }
  },
  PRO: {
    name: "Pro",
    price: 19.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO!, // Create in Stripe Dashboard
    features: [
      "Unlimited mock interviews",
      "Advanced AI feedback",
      "Full question bank",
      "Resume analysis",
      "Interview history"
    ],
    limits: {
      mockInterviews: Infinity,
      resumeAnalysis: Infinity,
    }
  },
  PREMIUM: {
    name: "Premium",
    price: 39.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!,
    features: [
      "Everything in Pro",
      "Priority support",
      "Custom interview scenarios",
      "1-on-1 coaching sessions",
      "Career guidance"
    ],
    limits: {
      mockInterviews: Infinity,
      resumeAnalysis: Infinity,
      coachingSessions: 2,
    }
  }
} as const;

export type PlanType = keyof typeof PLANS;