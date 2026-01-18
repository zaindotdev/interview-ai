"use client";
import React, { useState, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SignInSchema, SignInSchemaType } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const SignInPageContent = () => {
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Determine the callback URL based on plan
  const getCallbackUrl = () => {
    if (plan && plan !== 'free') {
      return `/subscription?plan=${plan}`;
    }
    return "/dashboard";
  };

  const submitForm = async (data: SignInSchemaType) => {
    setLoading(true);
    try {
      const callbackUrl = getCallbackUrl();
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Invalid Credentials", {
          description: "Please check your email and password",
        });
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid credentials", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn("github", {
        redirect: true,
        callbackUrl: getCallbackUrl(),
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Something went wrong", {
          description: error?.message,
        });
      }
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await signIn("google", {
        redirect: true,
        callbackUrl: getCallbackUrl(),
      });

      if (user?.error) {
        toast.error("Something went wrong", {
          description: user.error,
        });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Something went wrong", {
          description: error?.message,
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <section className={"flex min-h-screen w-full items-center justify-center"}>
      <Card
        className={
          "min-h-screen w-full max-w-md rounded-none sm:min-h-0 sm:rounded-xl"
        }
      >
        <CardHeader>
          <CardTitle>
            <h1
              className={
                "text-center text-lg font-medium text-pretty italic md:text-xl"
              }
            >
              Interview <span className={"text-primary"}>AI.</span>
            </h1>
          </CardTitle>
          <CardContent>
            <h2 className={"text-center text-2xl/8 font-semibold"}>
              Sign In to your account
            </h2>
          </CardContent>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitForm)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yourmail@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full cursor-pointer"
                type={"submit"}
                variant={"primary"}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </Form>
          <CardFooter className="mt-4 flex w-full items-center justify-center">
            <p>
              Don&apos;t have an Account? <Link href={"/sign-up"}>Sign Up</Link>
            </p>
          </CardFooter>
        </CardContent>
        <Separator />
        <CardFooter className="flex-col space-y-4 p-4">
          <p className="mb-4 text-center">OR</p>
          <Button
            onClick={handleGithubSignIn}
            className="w-full cursor-pointer"
            variant={"secondary"}
          >
            {githubLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <i className="ri-github-fill"></i>
            )}{" "}
            Sign In With Github
          </Button>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer"
            variant={"outline"}
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <i className="ri-google-fill"></i>
            )}{" "}
            Sign In With Google
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

const SignInPage = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
};

export default SignInPage;
