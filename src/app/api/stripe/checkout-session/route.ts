import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'line_items'],
    });

    return NextResponse.json({ 
      session: {
        payment_status: session.payment_status,
        customer_details: session.customer_details,
        amount_total: session.amount_total,
        currency: session.currency,
      }
    });
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve checkout session" },
      { status: 500 }
    );
  }
}
