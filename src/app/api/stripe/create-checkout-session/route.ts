import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Your NextAuth config
import { stripe } from "@/utils/stripe";
import { PLANS, PlanType } from "@/lib/subscription-plans";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await req.json();

    if (!planType || !(planType in PLANS)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const plan = PLANS[planType as PlanType];

    if (!plan.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if(!user){
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.subscriptionId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // TODO: Update user in database with stripeCustomerId
      await db.user.update({
        where: { id: user.id },
        data: { subscriptionId: customerId, isSubscribed: true },
      });

      if(user){
        await db.subscription.create({
          data:{
            userId: user?.id,
            paymentId: plan.priceId,
          }
        })

        await db.payment.create({
          data:{
            amount: plan.price,
            currency: "usd",
            method: "STRIPE",
            status: "PAID",
          }
        })
      }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType,
        },
      },
    });

    return NextResponse.json({ sessionUrl: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
