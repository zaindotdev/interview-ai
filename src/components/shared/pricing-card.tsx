"use client";
import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import Link from "next/link";

interface PricingCardProps {
  planType: "Free" | "Pro";
  description: string;
  price: string;
  features: readonly string[];
  buttonUrl: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  planType,
  features,
  price,
  description,
  buttonUrl,
}) => {
  return (
    <div className="flex h-full min-h-110 w-full max-w-sm flex-col rounded-lg border p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="mb-4 text-2xl font-bold">{planType} Plan</h2>
        <div className="mb-4 text-4xl font-bold">
          {price}
          <span className="text-muted-foreground text-sm font-normal">
            /month
          </span>
        </div>
      </div>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <div className="flex-1">
        {features.map((feature, index) => (
          <div key={index} className="mb-4 flex items-center">
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="text-primary mr-2 h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ strokeDasharray: 24, strokeDashoffset: 24 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  delay: index * 0.1 + 0.2,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </motion.svg>
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto w-full pt-2">
        <Button className="w-full" asChild>
          <Link href={buttonUrl}>
            {planType === "Free" ? "Get Started" : "Upgrade Now"}
          </Link>
        </Button>
      </div>
    </div>
  );
};
