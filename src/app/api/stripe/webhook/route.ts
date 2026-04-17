import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { db } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY!;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("[Stripe] Signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) break;

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) break;

        if (session.amount_total) {
          const payment = await db.payment.create({
            data: {
              amount: session.amount_total / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              method: "STRIPE",
              status: "PAID",
              stripePaymentId: session.id,
              stripeCustomerId: session.customer as string,
            },
          });

          await db.subscription.upsert({
            where: { userId },
            create: { userId, paymentId: payment.id },
            update: { paymentId: payment.id },
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const userSubscription = await db.subscription.findFirst({
          where: { payment: { stripeCustomerId } },
          include: { payment: true },
        });

        if (!userSubscription) break;

        if (subscription.status !== "active") {
          await db.payment.update({
            where: { id: userSubscription.paymentId },
            data: { status: "CANCELLED" },
          });
        } else {
          await db.payment.update({
            where: { id: userSubscription.paymentId },
            data: { status: "PAID" },
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const userSubscription = await db.subscription.findFirst({
          where: { payment: { stripeCustomerId } },
          include: { payment: true },
        });

        if (!userSubscription) break;

        await db.payment.update({
          where: { id: userSubscription.paymentId },
          data: { status: "CANCELLED" },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        if (!invoice.amount_paid) break;

        const userSubscription = await db.subscription.findFirst({
          where: { payment: { stripeCustomerId } },
          include: { payment: true },
        });

        if (!userSubscription) break;

        await db.payment.update({
          where: { id: userSubscription.paymentId },
          data: {
            status: "PAID",
            amount: invoice.amount_paid / 100,
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        const userSubscription = await db.subscription.findFirst({
          where: { payment: { stripeCustomerId } },
          include: { payment: true },
        });

        if (!userSubscription) break;

        await db.payment.update({
          where: { id: userSubscription.paymentId },
          data: { status: "FAILED" },
        });

        break;
      }

      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe] Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}