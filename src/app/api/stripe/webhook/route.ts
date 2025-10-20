import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // TODO: Update user subscription in database
        // await db.user.update({
        //   where: { id: session.metadata?.userId },
        //   data: {
        //     subscriptionId: session.subscription as string,
        //     subscriptionStatus: "active",
        //     planType: session.metadata?.planType,
        //   }
        // });
        
        console.log("Checkout completed:", session.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // TODO: Update subscription status
        // await db.user.update({
        //   where: { stripeCustomerId: subscription.customer as string },
        //   data: {
        //     subscriptionStatus: subscription.status,
        //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        //   }
        // });
        
        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // TODO: Cancel subscription in database
        // await db.user.update({
        //   where: { stripeCustomerId: subscription.customer as string },
        //   data: {
        //     subscriptionStatus: "canceled",
        //     subscriptionId: null,
        //     planType: "FREE",
        //   }
        // });
        
        console.log("Subscription canceled:", subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // TODO: Update payment status
        console.log("Payment succeeded:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // TODO: Handle failed payment
        console.log("Payment failed:", invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}