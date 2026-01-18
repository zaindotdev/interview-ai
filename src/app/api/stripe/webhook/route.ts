import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { db } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No stripe-signature header found");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log("Processing checkout.session.completed:", {
          sessionId: session.id,
          userId: session.metadata?.userId,
          planType: session.metadata?.planType,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        if (!session.metadata?.userId) {
          console.error("No userId in session metadata");
          break;
        }

        // Update user subscription in database
        await db.user.update({
          where: { id: session.metadata.userId },
          data: {
            isSubscribed: true,
          },
        });

        // Create payment record
        if (session.amount_total) {
          const payment = await db.payment.create({
            data: {
              amount: session.amount_total / 100, // Convert from cents
              currency: session.currency?.toUpperCase() || "USD",
              method: "STRIPE",
              status: "PAID",
              stripePaymentId: session.id, // Store Stripe session ID
            },
          });

          // Create or update subscription record
          const existingSubscription = await db.subscription.findUnique({
            where: { userId: session.metadata.userId },
          });

          if (existingSubscription) {
            await db.subscription.update({
              where: { userId: session.metadata.userId },
              data: {
                paymentId: payment.id,
              },
            });
          } else {
            await db.subscription.create({
              data: {
                userId: session.metadata.userId,
                paymentId: payment.id,
              },
            });
          }
        }

        console.log("Checkout completed successfully for user:", session.metadata.userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log("Subscription updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
        });

        // Find user by Stripe customer ID
        const user = await db.user.findFirst({
          where: { subscriptionId: subscription.customer as string },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              isSubscribed: subscription.status === "active",
            },
          });
          console.log("User subscription status updated:", user.id);
        } else {
          console.error("User not found for customer:", subscription.customer);
        }
        
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log("Subscription canceled:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // Find user by Stripe customer ID
        const user = await db.user.findFirst({
          where: { subscriptionId: subscription.customer as string },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              isSubscribed: false,
            },
          });

          // Update subscription record status if exists
          const userSubscription = await db.subscription.findUnique({
            where: { userId: user.id },
          });

          if (userSubscription) {
            await db.payment.update({
              where: { id: userSubscription.paymentId },
              data: { status: "CANCELLED" },
            });
          }

          console.log("User subscription canceled:", user.id);
        } else {
          console.error("User not found for customer:", subscription.customer);
        }
        
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log("Payment succeeded:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_paid,
        });

        // Find user and update payment record
        const user = await db.user.findFirst({
          where: { subscriptionId: invoice.customer as string },
        });

        if (user && invoice.amount_paid) {
          const userSubscription = await db.subscription.findUnique({
            where: { userId: user.id },
          });

          if (userSubscription) {
            await db.payment.update({
              where: { id: userSubscription.paymentId },
              data: { 
                status: "PAID",
                amount: invoice.amount_paid / 100, // Convert from cents
              },
            });
          }
        }
        
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log("Payment failed:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_due,
        });

        // Find user and update payment status
        const user = await db.user.findFirst({
          where: { subscriptionId: invoice.customer as string },
        });

        if (user) {
          const userSubscription = await db.subscription.findUnique({
            where: { userId: user.id },
          });

          if (userSubscription) {
            await db.payment.update({
              where: { id: userSubscription.paymentId },
              data: { status: "FAILED" },
            });
          }

          // Optionally disable subscription access
          await db.user.update({
            where: { id: user.id },
            data: { isSubscribed: false },
          });
        }
        
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