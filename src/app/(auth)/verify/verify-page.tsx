"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const VerifySchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

const VerifyPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const params = useSearchParams();
  const email = params.get("email");
  const router = useRouter();
  const form = useForm<z.infer<typeof VerifySchema>>({
    resolver: zodResolver(VerifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const verifyUser = useCallback(
    async (data: z.infer<typeof VerifySchema>) => {
      setLoading(true);
      try {
        console.log(data);
        const response = await axios.patch("/api/user/verify", {
          otp: data.otp,
          email,
        });
        if (response.status !== 200) {
          toast.error("We cannot verify your email", {
            description: "Try again later",
          });
          form.reset();
          return;
        } else {
          toast.success("Email verified successfully");
          setTimeout(() => {
            router.replace("/onboarding");
          }, 1500);
        }
      } catch (error) {
        console.error(error);
        toast.error("We cannot verify your email", {
          description:
            "There was an error verifying your email. Please try again later.",
        });
        form.reset();
      } finally {
        setLoading(false);
      }
    },
    [router, form, email],
  );

  return (
    <section className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <h1 className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-center text-2xl font-semibold text-transparent md:text-3xl/8">
              Verify Your Email
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p className="mx-auto max-w-xs text-center text-base md:text-lg/6">
              Please enter the OTP sent to your email to verify your email
              address.
            </p>
          </CardDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(verifyUser)}
              className="mt-4 flex w-full flex-col items-center justify-center gap-4"
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="mx-auto cursor-pointer"
                type="submit"
                disabled={loading || form.watch("otp").length !== 6}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verify"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};

export default VerifyPage;
