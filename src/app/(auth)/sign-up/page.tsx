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
import { SignUpSchema, SignUpSchemaType } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SignUpPageContent = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const submitForm = async (data: SignUpSchemaType) => {
    setLoading(true);
    try {
      const { data: user } = await axios.post("/api/user/sign-up", data, {
        headers: {
          "Content-Type": "application/json",
          withCredentials: "true",
        },
      });
      if (user.status !== 200) {
        toast.error(user?.message, {
          description: "An error occurred, please try again.",
        });
        return;
      }

      router.replace(`/verify`);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error("Something went wrong", {
          description: error?.response?.data?.message || "Unknown error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      const callbackUrl = "/onboarding";

      await signIn("github", {
        redirect: true,
        callbackUrl,
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
      const callbackUrl = "/onboarding";

      await signIn("google", {
        redirect: true,
        callbackUrl,
      });
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
    <section
      className={
        "flex min-h-screen w-full items-center justify-center font-sans"
      }
    >
      <Card className={"bg-background w-full max-w-md border-none shadow-none"}>
        <CardHeader>
          <CardTitle>
            <h2 className={"text-center text-2xl/8 font-semibold"}>
              Sign Up to your account
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className="text-lg"
                        type="name"
                        placeholder="Your Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Username</FormLabel>
                    <FormControl>
                      <Input
                        type="name"
                        placeholder="Your username"
                        {...field}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yourmail@example.com"
                        {...field}
                        className="text-lg"
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
                        <Input className="text-lg" type={showPass?'text':"password"} {...field} />
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
                {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
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
              <i className="ri-github-fill" />
            )}{" "}
            Sign Up With Github
          </Button>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer"
            variant={"outline"}
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <i className="ri-google-fill" />
            )}{" "}
            Sign Up With Google
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
};

export default SignUpPage;
