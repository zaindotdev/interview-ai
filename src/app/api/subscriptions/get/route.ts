import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });

    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      type: "recurring",
    });

    const plans = prices.data.map((price) => ({
      id: price.id,
      name: (price.product as Stripe.Product).name,
      description: (price.product as Stripe.Product).description,
      price: price.unit_amount,
      interval: price.recurring?.interval,
      price_id: price.id,
    }));

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching subscription plans" },
      { status: 500 },
    );
  }
}
