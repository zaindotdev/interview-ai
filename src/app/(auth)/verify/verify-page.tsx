"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Loader2, Mail, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifySchema = z.object({
  token: z.string(),
});

const VerifyPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [resent, setResent] = useState<boolean>(false);
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const form = useForm<z.infer<typeof VerifySchema>>({
    resolver: zodResolver(VerifySchema),
    defaultValues: { token: "" },
  });

  const verifyUser = useCallback(
    async (data: z.infer<typeof VerifySchema>) => {
      setLoading(true);
      try {
        const response = await axios.patch(
          "/api/user/verify",
          { verificationToken: token },
          { withCredentials: true },
        );
        if (response.status !== 200) {
          toast.error("We cannot verify your email", { description: "Try again later" });
          form.reset();
        } else {
          toast.success("Your email has been verified");
          router.push("/onboarding");
        }
      } catch (error) {
        console.error(error);
        toast.error("We cannot verify your email", {
          description: "There was an error verifying your email. Please try again later.",
        });
        form.reset();
      } finally {
        setLoading(false);
      }
    },
    [router, form, token],
  );

  useEffect(() => {
    if (token) {
      form.setValue("token", token);
      verifyUser({ token });
    }
  }, [verifyUser, token, form]);

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post("/api/user/resend-verification", {}, { withCredentials: true });
      setResent(true);
      toast.success("Verification email resent");
    } catch {
      toast.error("Failed to resend email", { description: "Try again later." });
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, color-mix(in srgb, currentColor 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border-none bg-background p-10 shadow-none">

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="absolute inset-[-8px] rounded-full border border-primary/10" />
            <div className="absolute inset-0 rounded-full border border-primary/20 bg-primary/8" />
            <Mail size={30} className="relative text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="mb-3 text-[11px] font-medium tracking-[0.18em] uppercase text-primary">
            Account Activation
          </p>
          <h1 className="mb-3 text-3xl font-light tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We've sent a verification link to your email address. Click it to
            activate your <span className="font-medium text-foreground font-serif">Interview AI</span> account.
          </p>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px bg-border" />

        {/* Loading state while auto-verifying */}
        {loading && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-primary/15 bg-primary/6 py-3 text-sm text-primary">
            <Loader2 size={15} className="animate-spin" />
            Verifying your email…
          </div>
        )}

        {/* Spam notice */}
        <div className="mb-6 flex gap-3 rounded-xl border border-primary/15 bg-primary/6 p-4">
          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/40">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Can't find the email? Check your{" "}
            <span className="font-medium text-foreground">spam or junk folder</span>{" "}
            — it sometimes ends up there.
          </p>
        </div>

        {/* Resend */}
        {resent ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/8 py-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 size={15} />
            Verification email sent
          </div>
        ) : (
          <Button
            onClick={handleResend}
            disabled={resending || loading}
            variant="outline"
            className="w-full"
          >
            {resending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                Resend verification email
              </>
            )}
          </Button>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Wrong account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-primary/70 transition-colors hover:text-primary"
          >
            Sign in with a different email
          </button>
        </p>
      </div>
    </section>
  );
};

export default VerifyPage;