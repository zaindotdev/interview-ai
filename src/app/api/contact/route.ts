import { ContactSchema } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { sendContactMail } from "@/utils/send-mail";

const supportMail = process.env.CONTACT_RECEIVER_EMAIL || process.env.RESEND_FROM_EMAIL;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const parsed = ContactSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid request body" },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY || !supportMail) {
      return NextResponse.json(
        { message: "Contact service is not configured. Add RESEND_API_KEY and CONTACT_RECEIVER_EMAIL in environment variables." },
        { status: 500 },
      );
    }

    const { name, email, subject, message } = parsed.data;
    const response = await sendContactMail({
      name,
      email,
      subject,
      message,
      supportMail,
    });

    if (!response) {
      return NextResponse.json(
        { message: "Failed to send message. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Your message has been sent successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Contact] API error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}