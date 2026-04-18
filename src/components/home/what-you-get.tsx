"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Bot, User } from "lucide-react";

const Card1Skeleton = ({ className }: { className?: string }) => {
  const waveFlat =
    "M0 50 Q 25 50 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50 T 450 50 T 500 50 T 550 50 T 600 50";
  const wave =
    "M0 50 Q 25 20 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50 T 450 50 T 500 50 T 550 50 T 600 50";

  return (
    <div
      className={cn(
        "relative flex h-28 w-full items-center overflow-hidden mask-r-from-0 mask-l-to-200%",
        className,
      )}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, type: "tween" }}
        className="text-muted-foreground absolute top-40 left-20 z-10"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="13" rx="3" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <path d="M12 19v3" />
          <path d="M8 23h8" />

          <motion.path
            initial={{ d: "M4 4 L20 20", opacity: 1 }}
            animate={{ d: "M4 4 L4 4", opacity: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.3,
              repeat: Infinity,
              repeatDelay: 5,
            }}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-20 bottom-8 z-10"
      >
        <motion.div
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "bottom center" }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />

            {/* Left ear */}
            <motion.path
              d="M2 14h2"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "4px 14px" }}
            />

            {/* Right ear */}
            <motion.path
              d="M20 14h2"
              animate={{ rotate: [10, -10, 10] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "20px 14px" }}
            />

            {/* Left eye */}
            <motion.path
              d="M9 13v2"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 3 }}
              style={{ transformOrigin: "9px 14px" }}
            />

            {/* Right eye */}
            <motion.path
              d="M15 13v2"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 3 }}
              style={{ transformOrigin: "15px 14px" }}
            />
          </svg>
        </motion.div>
      </motion.div>

      <svg viewBox="0 0 600 100" className="absolute bottom-0 h-full w-[200%]">
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary/50"
            initial={{ d: waveFlat, x: "0%" }}
            animate={{ d: wave, x: "-50%" }}
            transition={{
              d: { duration: 1.2, ease: "easeOut", delay: 0.4 + i * 0.15 },
              x: { duration: 4 + i, ease: "linear", repeat: Infinity },
            }}
            style={{ opacity: 0.6 - i * 0.15 }}
          />
        ))}
      </svg>
    </div>
  );
};

const Card2Skeleton = ({ className }: { className?: string }) => {
  const bars = [98, 88, 36, 93, 65, 74, 82, 55, 69];

  return (
    <div
      className={cn(
        "flex h-32 w-full items-end justify-center gap-1 px-2 sm:gap-2",
        className,
      )}
    >
      {bars.map((height, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
          className="bg-primary/55 relative min-w-0 flex-1 origin-bottom rounded-t-xl"
          style={{ height: `${height}%` }}
        >
          <p className="text-foreground/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-270 text-[10px] font-medium sm:text-xs">
            {height}%
          </p>
        </motion.div>
      ))}
    </div>
  );
};
const bubbleVariants = {
  hiddenLeft: { opacity: 0, x: -40, y: 20, scale: 0.95 },
  hiddenRight: { opacity: 0, x: 40, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};
const avatarVariants = {
  hiddenLeft: { opacity: 0, x: -20, y: 20, scale: 0.8 },
  hiddenRight: { opacity: 0, x: 20, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 18,
    },
  },
};

export const Card3Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-border bg-card flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-xl border p-6",
        className,
      )}
    >
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-lg font-medium"
      >
        Mock Interview
      </motion.h2>

      {/* AI Message */}
      <div className="flex items-end gap-3">
        {/* Avatar */}
        <motion.div
          variants={avatarVariants}
          initial="hiddenLeft"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="border-primary bg-primary/10 text-primary flex items-center justify-center rounded-full border-2 p-2"
        >
          <Bot />
        </motion.div>

        {/* Bubble */}
        <motion.div
          variants={bubbleVariants}
          initial="hiddenLeft"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="border-primary bg-primary/5 text-primary max-w-[75%] rounded-2xl rounded-bl-sm border px-3 py-2 text-sm"
        >
          How do you handle tight deadlines and multiple projects at once?
        </motion.div>
      </div>

      {/* User Message */}
      <div className="flex items-end justify-end gap-3">
        {/* Bubble */}
        <motion.div
          variants={bubbleVariants}
          initial="hiddenRight"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="bg-muted text-muted-foreground max-w-[75%] rounded-2xl rounded-br-sm px-3 py-2 text-sm"
        >
          I prioritize tasks based on urgency and importance, often using a task
          management tool to keep track. I also communicate proactively with
          stakeholders to manage expectations and ensure alignment on deadlines.
        </motion.div>

        {/* Avatar */}
        <motion.div
          variants={avatarVariants}
          initial="hiddenRight"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="border-primary bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-full border-2 p-2"
        >
          <User />
        </motion.div>
      </div>
    </div>
  );
};

const CardDetails = [
  {
    title: "Live Mock Sessions",
    description:
      "Role-specific interviews with an AI that adapts its follow-up questions to your answers.",
    skeleton: Card1Skeleton,
  },
  {
    title: "Real-time feedback",
    description:
      "Instant scoring on clarity, structure, and confidence — not after the fact, but as you speak.",
    skeleton: Card2Skeleton,
  },
  {
    title: "Question bank",
    description:
      "Thousands of curated questions across behavioral, technical, and case formats.",
    skeleton: Card3Skeleton,
  },
];

const WhatYouGetSection = () => {
  return (
    <section id="features" className="mb-24">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="font-lighter text-xl tracking-wide uppercase"
      >
        What You Get
      </motion.h3>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.1 }}
        className="mt-2 text-4xl font-bold"
      >
        Everything to walk in ready
      </motion.h2>
      <div
        className={"gap-8 mt-10 flex flex-wrap items-center justify-center"}
      >
        {CardDetails.map((card, index) => {
          const Skeleton = card.skeleton;
          return (
            <Card className="w-full max-w-sm shrink-0 rounded-4xl" key={index}>
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="h-64 w-full"
                >
                  <Skeleton className="mb-2 h-64 w-full" />
                </motion.div>
              </CardHeader>
              <CardContent className="-mt-4 ml-2">
                <motion.h4
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-primary text-lg font-semibold"
                >
                  {card.title}
                </motion.h4>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-muted-foreground text-sm"
                >
                  {card.description}
                </motion.p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default WhatYouGetSection;
