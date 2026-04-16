export const PLANS = {
  FREE: {
    name: "Free",
    description:
      "For job seekers who want to try out our platform and get a taste of what we offer with limited access to features.",
    price: 0,
    productId: "",
    features: [
      "2 mock interviews per month",
      "Basic feedback",
      "Limited question bank",
    ],
    limits: {
      mockInterviews: 2,
      resumeAnalysis: 2,
    },
  },
  PRO: {
    name: "Pro",
    price: 19.99,
    description:
      "For job seekers who want to seriously prepare for their interviews with unlimited practice and detailed feedback.",
    productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PRO || "",
    features: [
      "Unlimited mock interviews",
      "Advanced AI feedback",
      "Full question bank",
      "Resume analysis",
      "Interview history",
    ],
    limits: {
      mockInterviews: Infinity,
      resumeAnalysis: Infinity,
    },
  },
  PREMIUM: {
    name: "Premium",
    description:
      "For job seekers who want to take their interview preparation to the next level with personalized coaching and career guidance.",
    price: 39.99,
    productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PREMIUM || "",
    features: [
      "Everything in Pro",
      "Priority support",
      "Custom interview scenarios",
      "1-on-1 coaching sessions",
      "Career guidance",
    ],
    limits: {
      mockInterviews: Infinity,
      resumeAnalysis: Infinity,
      coachingSessions: 2,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
