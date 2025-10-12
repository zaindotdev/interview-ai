import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(session);

    if (session.payment_status === 'paid') {
      // await updateUserSubscriptionStatus(session.client_reference_id, 'active');
    }

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
