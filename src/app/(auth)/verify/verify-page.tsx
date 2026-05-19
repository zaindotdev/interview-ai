"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // useRouter still needed for post-verify redirect
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Mail, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

const VerifyPage = () => {
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent]     = useState(false);
  const params = useSearchParams();
  const token  = params.get("token");
  const router = useRouter();

  const verifyUser = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.patch(
        "/api/user/verify",
        { verificationToken: token },
        { withCredentials: true },
      );
      const { autoLoginToken, email } = response.data;
      toast.success("Email verified! Signing you in…");
      const result = await signIn("credentials", {
        email,
        autoLoginToken,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/subscription");
      } else {
        toast.error("Auto sign-in failed", { description: "Please sign in manually." });
        router.push("/sign-in");
      }
    } catch {
      toast.error("Verification failed", {
        description: "There was an error verifying your email. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (token) verifyUser();
  }, [token, verifyUser]);

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
    <div className="w-full max-w-sm space-y-8">

      {/* Icon */}
      <div className="flex justify-start">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Pulse rings */}
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <span className="absolute -inset-2 rounded-full border border-primary/10" />
          {/* Icon bg */}
          <span className="absolute inset-0 rounded-full border border-primary/20 bg-primary/8" />
          <Mail size={26} className="relative text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-widest uppercase text-primary">
          Account Activation
        </p>
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We&apos;ve sent a verification link to your email. Click it to activate your{" "}
          <span className="font-serif font-medium text-foreground">Interview AI</span> account.
        </p>
      </div>

      {/* Verifying indicator */}
      {loading && (
        <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/6 px-4 py-3 text-sm text-primary">
          <Loader2 size={14} className="animate-spin shrink-0" />
          Verifying your email…
        </div>
      )}

      {/* Spam hint */}
      <div className="flex gap-3 rounded-xl border border-border bg-secondary/50 p-4">
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/40">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Can&apos;t find the email? Check your{" "}
          <span className="font-medium text-foreground">spam or junk folder</span>{" "}
          — it sometimes ends up there.
        </p>
      </div>

      {/* Resend / sent state */}
      {resent ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/8 py-3 text-sm text-primary">
          <CheckCircle2 size={15} />
          Verification email sent
        </div>
      ) : (
        <Button
          onClick={handleResend}
          disabled={resending || loading}
          variant="outline"
          className="h-11 w-full rounded-xl border-border hover:border-primary/30 hover:bg-secondary"
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

    </div>
  );
};

export default VerifyPage;