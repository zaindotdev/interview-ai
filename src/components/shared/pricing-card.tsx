"use client";

import React, { useState } from "react";
import { CheckCircle, Star, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  tier?: "basic" | "pro";
  popular?: boolean;
  badge?: string;
  planKey?: "FREE" | "PRO" | "PREMIUM";
  productId?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  originalPrice,
  features,
  buttonText,
  buttonLink,
  tier = "basic",
  popular = false,
  badge,
  planKey,
  productId,
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      if (planKey === "FREE" || !productId) {
        if (session) {
          router.push("/dashboard");
        } else {
          router.push("/sign-up");
        }
        return;
      }

      if (!session) {
        router.push(`/sign-up`);
        return;
      }
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };


  const getTierIcon = () => {
    switch (tier) {
      case "basic":
        return <Star className="h-5 w-5" />;
      case "pro":
        return <Zap className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      className={cn(
        "relative flex flex-col justify-between rounded-lg border p-6"
      )}
      whileHover={{ scale: 1.02 }}
    >
      {popular && (
        <Badge variant={'default'} className="absolute top-4 right-4">
          Most Popular
        </Badge>
      )}
      {badge && (
        <Badge variant="outline" className="absolute top-4 right-4">
          {badge}
        </Badge>
      )}

      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className={cn("p-2 rounded-md")}>
            {getTierIcon()}
          </div>
          <h3
            className={cn(
              "text-lg font-semibold",
            )}
          >
            {title}
          </h3>
        </div>
        <p className={cn("mb-6")}>{description}</p>
        <div className="mb-6">
          <span
            className={cn(
              "text-3xl font-extrabold",
            )}
          >
            {price}
          </span>
          {originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {originalPrice}
            </span>
          )}
        </div>
        <ul className="mb-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className={cn("flex items-center space-x-2")}>
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        className={cn("w-full")}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : buttonText}
      </Button>
    </motion.div>
  );
};
