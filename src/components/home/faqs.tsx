"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI feedback work?",
    answer:
      "Our AI analyzes your spoken responses in real-time, evaluating clarity, confidence, and relevance to give you actionable feedback.",
  },
  {
    question: "Can I upload my own CV?",
    answer:
      "Yes, you can upload your CV to tailor the questions and feedback specifically to your experience and target role.",
  },
  {
    question: "Is this suitable for beginners?",
    answer:
      "Absolutely. Whether you're preparing for your first interview or refining advanced skills, the platform adapts to your level.",
  },
  {
    question: "Can I track my progress?",
    answer:
      "Yes, you can review past sessions, recordings, and feedback to monitor your improvement over time.",
  },
];

const FAQs = () => {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="font-lighter text-center text-xl tracking-wide uppercase"
        >
          Frequently Asked Questions
        </motion.h3>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            delay: 0.1,
          }}
          className="mt-2 text-center text-4xl font-bold"
        >
          Your Questions, Answered
        </motion.h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="px-4 border-primary"
              >
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
};

export default FAQs;
