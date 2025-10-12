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
    </div>
  );
}