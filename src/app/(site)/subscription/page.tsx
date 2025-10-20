<<<<<<< HEAD
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan{
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  price_id: string;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // Fetch subscription plans from your API
    fetch('/api/subscriptions/get')
      .then(res => res.json())
      .then(data =>{
        console.log(data)
         setPlans(data)});
  }, []);

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Choose a Subscription Plan</h1>
      {plans.map(plan => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>Price: ${plan.price / 100} / {plan.interval}</p>
          <button onClick={() => handleSubscribe(plan.price_id)}>Subscribe</button>
        </div>
      ))}
=======
import { PLANS } from "@/lib/subscription-plans";
import { SubscriptionButton } from "@/components/shared/subscription-button";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">
        Choose Your Plan
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            className="border rounded-lg p-8 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="text-3xl font-bold mb-6">
              ${plan.price}
              <span className="text-sm font-normal">/month</span>
            </div>
            
            <ul className="mb-8 space-y-3 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            {key === "FREE" ? (
              <button className="w-full py-3 border rounded">
                Current Plan
              </button>
            ) : (
              <SubscriptionButton
                planType={key as "PRO" | "PREMIUM"}
                className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Subscribe to {plan.name}
              </SubscriptionButton>
            )}
          </div>
        ))}
      </div>
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    </div>
  );
}