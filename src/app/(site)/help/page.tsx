"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CircleHelp,
  CreditCard,
  LifeBuoy,
  Mail,
  Sparkles,
} from "lucide-react";

const faqItems = [
  {
    question: "How do I start my first mock interview?",
    answer:
      "After signing in, go to your dashboard and open Mock Interviews. Choose a role, difficulty, and start your session. If your account is new, onboarding also guides you through this flow.",
  },
  {
    question: "Why can I not access premium features?",
    answer:
      "Premium features require an active subscription with a successful payment status. Visit Subscription to verify your plan, and if billing looks correct but access is missing, use Contact Support.",
  },
  {
    question: "Can I update my resume and regenerate questions?",
    answer:
      "Yes. Upload a new PDF resume in onboarding or analysis flow and provide the updated job description. Interview AI will generate a fresh set of tailored interview questions.",
  },
  {
    question: "Where can I see interview history and reports?",
    answer:
      "Open Interview History from the main dashboard navigation to review past sessions, reports, and key feedback points.",
  },
  {
    question: "How long does support take to respond?",
    answer:
      "Most support requests receive a response within one business day. Urgent account access issues are prioritized.",
  },
];

const supportCards = [
  {
    title: "Contact Support",
    description:
      "Report account, payment, or onboarding issues and get help from the team.",
    href: "/contact",
    icon: Mail,
    cta: "Open Contact Form",
  },
  {
    title: "Billing & Subscription",
    description:
      "Manage plan upgrades, checkout issues, and billing questions in one place.",
    href: "/subscription",
    icon: CreditCard,
    cta: "Manage Subscription",
  },
  {
    title: "Product Guidance",
    description:
      "Learn how to use mock interviews, resume analysis, and your reports effectively.",
    href: "/dashboard",
    icon: LifeBuoy,
    cta: "Go to Dashboard",
  },
];

const HelpPage = () => {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-8 left-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="border-border bg-card/80 rounded-2xl border p-6 shadow-lg backdrop-blur sm:p-8"
        >
          <div className="bg-secondary text-secondary-foreground mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Help Center
          </div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Need help with Interview AI?
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
            Find answers quickly, troubleshoot common issues, and reach support
            when you need direct help.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {supportCards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06, ease: "easeOut" }}
              >
                <Card className="border-border bg-card/80 h-full shadow-sm backdrop-blur transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2 text-xl">
                      <Icon className="h-5 w-5 text-primary" />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {card.description}
                    </p>
                    <Button asChild variant="secondary" className="w-full justify-between">
                      <Link href={card.href}>
                        {card.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="border-border bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2 text-2xl">
              <CircleHelp className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HelpPage;