"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import axios from 'axios';
import { PLANS } from "@/lib/subscription-plans";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface SubscriptionButtonProps {
  planType: "PRO" | "PREMIUM";
  children: React.ReactNode;
  className?: string;
}

export function SubscriptionButton({
  planType,
  children,
  className = "",
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const response = await axios.post("/api/stripe/create-checkout-session", {
        productId: PLANS[planType].productId,
      })

      const { url } = await response.data;
      if (!url) throw new Error("No checkout URL returned");

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      router.push(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={loading} className={className}>
      {loading ? (
        <span>
          <Loader2 /> Loading...
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
