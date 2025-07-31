"use client";
import React, { useState } from "react";
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

const SignInPage = () => {
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitForm = async (data: SignInSchemaType) => {
    setLoading(true);
    try {
      console.log(data);
      const user = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email: data.email,         // <-- Pass email
        password: data.password,   // <-- Pass password
      });
      if (user?.error) {
        toast.error("Something went wrong", {
          description: user.error,
        });
      } else {
        toast.success("Signed in successfully");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Something went wrong", {
          description: error?.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn("github", {
        redirect: true,
        callbackUrl: "/dashboard",
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
        callbackUrl: "/dashboard",
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
    <section className={"w-full min-h-screen flex items-center justify-center"}>
      <Card className={"max-w-md w-full"}>
        <CardHeader>
          <CardTitle>
            <h1
              className={
                "text-lg md:text-xl font-medium italic text-pretty text-center"
              }
            >
              Interview <span className={"text-primary"}>AI.</span>
            </h1>
          </CardTitle>
          <CardContent>
            <h2 className={"text-2xl/8 font-semibold text-center"}>
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
          <CardFooter className="w-full mt-4 flex items-center justify-center">
            <p>
              Don&apos;t have an Account? <Link href={"/sign-up"}>Sign Up</Link>
            </p>
          </CardFooter>
        </CardContent>
        <Separator />
        <CardFooter className="p-4 space-y-4 flex-col">
          <p className="text-center mb-4">OR</p>
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

export default SignInPage;
