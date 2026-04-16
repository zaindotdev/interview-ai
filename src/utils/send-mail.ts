import VerificationEmail from "@/components/mail/verification-email";
import {SubscriptionCompleteEmail} from "@/components/mail/subscription-mail"
import { Resend } from "resend";

const fromMail = process.env.RESEND_FROM_EMAIL || "noreply@interview-ai.live";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendMail({
  email,
  name,
  verificationToken,
}: {
  email: string;
  name: string;
  verificationToken: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Interview AI <${fromMail}>`,
    to: [email],
    subject: "Verification Email for Interview AI",
    react: await VerificationEmail({ name, verificationToken }),
  });

  if (error) {
    console.error({ error });
    return false;
  }
  return true;
}


export async function sendSubscriptionConfirmationEmail({
  email,
  name,
  plan,
  amount,
  currency,
  billingCycle,
  startDate,
  nextBillingDate,
  transactionId,
  paymentMethod,
}: {
  email: string;
  name: string;
  plan: string;
  amount: string;
  currency?: string;
  billingCycle: "monthly" | "yearly";
  startDate: string;
  nextBillingDate: string;
  transactionId: string;
  paymentMethod: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Interview AI <${fromMail}>`,
    to: [email],
    subject: "Your Subscription is Active!",
    react: await SubscriptionCompleteEmail({
      name,
      plan,
      amount,
      currency,
      billingCycle,
      startDate,
      nextBillingDate,
      transactionId,
      paymentMethod,
    }),
  });

  if (error) {
    console.error({ error });
    return false;
  }
  return true;
}