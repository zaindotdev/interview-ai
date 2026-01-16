"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/subscription-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (productId: string, planName: string) => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (!productId) {
      alert("Stripe is not configured. Please add your Stripe Product IDs to the environment variables.");
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        alert(data.error || "Failed to create checkout session");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan to ace your interviews
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card
            key={key}
            className={`relative flex flex-col ${
              key === "PRO" ? "border-primary shadow-lg scale-105" : ""
            }`}
          >
            {key === "PRO" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {key === "FREE" ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Get Started
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.productId, plan.name)}
                  disabled={loading === plan.name || !plan.productId}
                >
                  {loading === plan.name
                    ? "Loading..."
                    : !plan.productId
                    ? "Coming Soon"
                    : `Subscribe to ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          All plans include secure payment processing and can be cancelled anytime.
        </p>
      </div>
    </div>
  );
}