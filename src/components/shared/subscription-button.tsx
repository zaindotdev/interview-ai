"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import axios from 'axios';

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

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const response = await axios.post("/api/stripe/create-checkout-session", {
        planType,
      })

      const { sessionUrl, error } = await response.data;
      
      if (error) {
        throw new Error(error);
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      window.location.href = sessionUrl;
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
