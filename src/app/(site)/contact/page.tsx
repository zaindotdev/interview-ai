"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSchema, ContactSchemaType } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { Loader2, Mail, MessageCircle, Sparkles } from "lucide-react";

const ContactPage = () => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ContactSchemaType>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactSchemaType) => {
    setSubmitting(true);

    try {
      const response = await axios.post("/api/contact", values, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Message sent", {
        description: response.data?.message || "We will get back to you soon.",
      });

      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error("Could not send message", {
          description:
            error.response?.data?.message ||
            "Please try again in a few moments.",
        });
      } else {
        toast.error("Could not send message", {
          description: "Please try again in a few moments.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/30 absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-accent/35 absolute right-10 bottom-0 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/80 shadow-xl backdrop-blur">
          <CardHeader>
            <div className="bg-secondary text-secondary-foreground border-primary/20 mb-2 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Let&apos;s Talk
            </div>
            <CardTitle className="text-card-foreground text-3xl font-semibold tracking-tight">
              Contact Interview AI
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Share your question, issue, or feedback. We usually respond within
              24 hours.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="How can we help?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what you need help with..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/75 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-card-foreground text-2xl font-semibold">
              Support Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-6">
            <div className="border-border bg-muted/30 rounded-xl border p-4">
              <div className="text-card-foreground mb-2 flex items-center gap-2">
                <Mail className="text-primary h-4 w-4" />
                <span className="font-medium">Email Support</span>
              </div>
              <p className="text-sm leading-relaxed">
                Use this form to contact us for billing, feature requests,
                onboarding, or account issues.
              </p>
            </div>

            <div className="border-border bg-card space-y-2 rounded-xl border p-4">
              <h3 className="text-card-foreground font-medium">
                What happens next?
              </h3>
              <p className="text-sm">
                1. Your message is sent directly to our support inbox.
              </p>
              <p className="text-sm">
                2. We review and respond, usually within one business day.
              </p>
              <p className="text-sm">
                3. Critical access issues are prioritized immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactPage;
