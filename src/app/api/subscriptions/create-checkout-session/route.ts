import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request:NextRequest) {
  const { priceId } = await request.json();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{typescript:true});
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/subscriptions`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}