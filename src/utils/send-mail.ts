import VerificationEmail from "@/components/mail/verification-email";
import { Resend } from "resend";


export async function sendMail({
  email,
  name,
  otp,
  otpExpiry,
}: {
  email: string;
  name: string;
  otp: string;
  otpExpiry: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Interview AI <admin@netechie.com>",
    to: [email],
    subject: "Verification Email for Interview AI",
    react: await VerificationEmail({ name, otp, otpExpiry }),
  });

  if (error) {
    console.error({ error });
    return false;
  }
  return true;
}
