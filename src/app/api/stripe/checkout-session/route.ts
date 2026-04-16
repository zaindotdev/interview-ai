import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import {sendSubscriptionConfirmationEmail} from "@/utils/send-mail"

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'line_items'],
    });

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Customer";
    const planDescription = session.line_items?.data[0]?.description || "Subscription Plan";
    const amountTotal = (session.amount_total || 0) / 100;
    const currency = session.currency?.toUpperCase() || "USD";
    let billingCycle: "monthly" | "yearly" = "monthly";
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
      billingCycle = subscription.billing_cycle_anchor ? "monthly" : "yearly";
    } else {
      billingCycle = "monthly";
    }
    const startDate = new Date(session.created * 1000).toISOString();
    const nextBillingDate = new Date((session.created + 30 * 24 * 60 * 60) * 1000).toISOString();
    const transactionId = session.payment_intent || "";
    const paymentMethod = session.payment_method_types ? session.payment_method_types[0] : "N/A";

    if (customerEmail) {
      await sendSubscriptionConfirmationEmail({
        email: customerEmail,
        name: customerName,
        plan: planDescription,
        amount: amountTotal.toFixed(2),
        currency,
        billingCycle,
        startDate,
        nextBillingDate,
        transactionId: String(transactionId),
        paymentMethod,
      });
    }

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
