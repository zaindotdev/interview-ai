import { Resend } from "resend";
import { EmailTemplate } from "@/components/mail/email-template";

interface SendMailParams{
    email:string,
    name:string,
    callbackUrl:string
}

const resendClient = new Resend(process.env.RESEND_API_KEY!);

export const sendMail = async ({ email,name,callbackUrl }: SendMailParams) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: process.env.EMAIL!,
      to: email,
      subject: "Email Verification",
      react: EmailTemplate({ name,callbackUrl }),
    });
    if (error) {
      console.error(error);
      throw new Error(error.message);
    }
    return data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

