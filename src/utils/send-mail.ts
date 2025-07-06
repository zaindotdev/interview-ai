import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL!,
        pass: process.env.USER_PASSWORD!,
    },
});

export async function sendMail(name:string, email: string, callbackUrl: string) {
    try {
        const { response } = await transporter.sendMail({
            from: process.env.USER_EMAIL!,
            to: email,
            subject: "Verify your email",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h1 style="font-size: 24px; line-height: 1.4; font-weight: bold;">Hi! ${name}</h1>
          <p style="font-size: 16px; line-height: 1.5; font-weight: normal;">
            To complete your registration, please confirm your email address by clicking the link below.
            Verifying your email helps us ensure the security of your account and provide you with the best possible experience.
            If you require any assistance, feel free to contact our support team.
          </p>
          <a href="${callbackUrl}" style="display: inline-block; margin-top: 20px; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; font-size: 18px; border-radius: 6px;">
            Verify Email
          </a>
        </div>
      `,
        });

        if (!response) return new Error("Email not sent");
        return true;
    } catch (error) {
        console.error(error);
        throw new Error(error as string);
    }
}
