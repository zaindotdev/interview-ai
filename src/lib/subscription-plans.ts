export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    productId: "", // No Stripe product ID for free
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
    productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PRO || "", // Product ID from Stripe Dashboard
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
    productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PREMIUM || "", // Product ID from Stripe Dashboard
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