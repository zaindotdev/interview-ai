"use client";
import React, { useState, Suspense } from "react";
import {
  Form, FormField, FormControl, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SignInSchema, SignInSchemaType } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SignInPageContent = () => {
  const [loading, setLoading]           = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass]         = useState(false);

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitForm = async (data: SignInSchemaType) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (result?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn("github", { redirect: true, callbackUrl: "/dashboard" });
    } catch (error) {
      if (error instanceof Error)
        toast.error("Something went wrong", { description: error.message });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn("google", { redirect: true, callbackUrl: "/dashboard" });
      if (result?.error)
        toast.error("Something went wrong", { description: result.error });
    } catch (error) {
      if (error instanceof Error)
        toast.error("Something went wrong", { description: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">

      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue your interview prep
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3">
        <OAuthButton onClick={handleGoogleSignIn} loading={googleLoading} icon="ri-google-fill">
          Google
        </OAuthButton>
        <OAuthButton onClick={handleGithubSignIn} loading={githubLoading} icon="ri-github-fill">
          GitHub
        </OAuthButton>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] tracking-widest uppercase text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Credentials form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-border bg-input focus:border-primary/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      className="h-11 rounded-xl border-border bg-input pr-10 focus:border-primary/50"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass
                        ? <EyeOffIcon size={16} />
                        : <EyeIcon size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

function OAuthButton({
  children, onClick, loading, icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl border border-border",
        "bg-background text-sm font-medium text-foreground",
        "hover:bg-secondary hover:border-primary/30 transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {loading
        ? <Loader2 size={15} className="animate-spin text-muted-foreground" />
        : <i className={cn(icon, "text-base")} />}
      <span>{children}</span>
    </button>
  );
}

const SignInPage = () => (
  <Suspense fallback={
    <div className="flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  }>
    <SignInPageContent />
  </Suspense>
);

export default SignInPage;