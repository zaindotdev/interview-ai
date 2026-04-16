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
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const SignInPageContent = () => {
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
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
    if (plan && plan !== "free") {
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
      <Card className={"bg-background w-full max-w-md border-none shadow-none"}>
        <CardHeader>
          <CardTitle>
            <h2 className={"text-center text-2xl/8 font-semibold"}>
              Sign In to your account
            </h2>
          </CardTitle>
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
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="text-lg"
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
                    <FormLabel className="text-lg">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="text-lg"
                          type={showPass ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute top-1.5 right-2"
                        >
                          {showPass ? (
                            <EyeOffIcon
                              size={20}
                              onClick={() => setShowPass(false)}
                              className="cursor-pointer"
                            />
                          ) : (
                            <EyeIcon
                              size={20}
                              onClick={() => setShowPass(true)}
                              className="cursor-pointer"
                            />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full cursor-pointer" type={"submit"}>
                {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col space-y-4 p-4">
          <p className="mb-4 text-center">OR</p>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer border-none shadow-none hover:bg-primary/10"
            variant={"outline"}
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <i className="ri-google-fill"></i>
            )}{" "}
            Sign In With Google
          </Button>
          <Button
            onClick={handleGithubSignIn}
            className="w-full cursor-pointer border-none shadow-none hover:bg-primary/10"
            variant={"outline"}
          >
            {githubLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <i className="ri-github-fill"></i>
            )}{" "}
            Sign In With Github
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

const SignInPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
};

export default SignInPage;
