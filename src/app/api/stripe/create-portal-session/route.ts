import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/utils/stripe";
import { db } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database to retrieve Stripe customer ID
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionId: true,
        isSubscribed: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: "No subscription found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    // Create portal session for managing subscription
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.subscriptionId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    console.error("Error creating portal session:", error);
    const message = error instanceof Error
      ? error.message
      : "Failed to create portal session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}