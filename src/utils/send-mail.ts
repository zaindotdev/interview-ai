import VerificationEmail from "@/components/mail/verification-email";
import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({email, name, verificationLink}:{email:string, name:string, verificationLink:string}) {
  const { error } = await resend.emails.send({
    from: 'Interview AI <admin@netechie.com>',
    to: [email],
    subject: 'Verification Email for Interview AI',
    react: await VerificationEmail({name, verificationLink}),
  });

  if (error) {
    console.error({ error });
    return false
  }
  return true
}