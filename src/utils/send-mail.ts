import VerificationEmail from "@/components/mail/verification-email";
import { SubscriptionCompleteEmail } from "@/components/mail/subscription-mail";
import { Resend } from "resend";
import { ContactEmail } from "@/components/mail/contact-mail";

const fromMail = process.env.RESEND_FROM_EMAIL || "noreply@interview-ai.live";

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

export async function sendContactMail({
  name,
  email,
  subject,
  message,
  supportMail,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  supportMail: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `Interview AI <${fromMail}>`,
    to: [supportMail],
    replyTo: email,
    subject: `[Contact] ${subject}`,
    react: await ContactEmail({
      name,
      email,
      subject,
      message,
      receivedAt: new Date().toUTCString(),
    }),
  });
  if (error) {
    console.error({ error });
    return false;
  }
  return true;
}
