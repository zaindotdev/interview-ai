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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Find the plan type from productId
    let planType: PlanType | null = null;
    let plan = null;

    for (const [key, value] of Object.entries(PLANS)) {
      if (value.productId === productId) {
        planType = key as PlanType;
        plan = value;
        break;
      }
    }

    if (!planType || !plan) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Fetch the active price for this product from Stripe
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    if (!prices.data || prices.data.length === 0) {
      return NextResponse.json(
        { error: "No active price found for this product" },
        { status: 400 }
      );
    }

    const priceId = prices.data[0].id;

    // Get user from database
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        subscriptionId: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.subscriptionId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: user.id },
        data: { subscriptionId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        planType: planType,
        productId: productId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType,
          productId: productId,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
