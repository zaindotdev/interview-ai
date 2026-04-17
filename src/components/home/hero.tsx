"use client";

import { Badge } from "@/components/ui/badge";
import { Dot, Mic, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const userAvatars = [
  { name: "Zain", initials: "ZA", colorClass: "bg-[#d2b89f] text-[#3a2c21]" },
  { name: "Mia", initials: "MK", colorClass: "bg-[#89c7c2] text-[#224846]" },
  { name: "Sam", initials: "SR", colorClass: "bg-[#b7d0e9] text-[#28405f]" },
  { name: "Fatima", initials: "FQ", colorClass: "bg-[#d4c3ef] text-[#3f2f5f]" },
];

const avatarContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.4 },
  },
};

const avatarItem = {
  hidden: { opacity: 0, scale: 0, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    animate: { opacity: 1, scale: 1.4, y: -6 },
    transition: {
      opacity: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 0.9,
      },
      scale: {
        type: "spring" as const,
        stiffness: 320,
        damping: 8,
      },
    },
  },
};

const textFade = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    animate: { opacity: 1, scale: 1, y: 5 },
    transition: {
      opacity: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.0,
      },
      scale: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.0,
      },
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
        delay: 0.8,
      },
    },
  },
};

const cardContainer = {
  hidden: {},
  show: {
    animate: { opacity: 1, scale: 1, y: -4 },
    transition: {
      opacity: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.1,
        staggerChildren: 0.1,
        delayChildren: 0.75,
      },
      scale: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.1,
      },
      y: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
        delay: 0.4,
      },
    },
  },
};

const cardRow = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    animate: { opacity: 1, scale: 1, y: 5 },
    transition: {
      opacity: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.2,
      },
      scale: {
        type: "spring" as const,
        stiffness: 320,
        damping: 18,
        delay: 1.2,
      },
      y: {
        duration: 2.2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
        delay: 0.6,
      },
    },
  },
};

const shimmer = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const decorativeBubbles = [
  {
    id: 1,
    className:
      "absolute bottom-10 left-8 md:left-12 w-8 h-8 rounded-full bg-secondary",
    initial: { opacity: 0, scale: 0.4, y: 16 },
    animate: { opacity: 1, scale: 1.2, y: [0, -6, 0] },
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 18,
      delay: 0.9,
      y: {
        duration: 3.6,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 1.2,
      },
    },
  },
  {
    id: 2,
    className:
      "absolute top-12 right-10 md:right-16 w-6 h-6 rounded-full bg-secondary/60",
    initial: { opacity: 0, scale: 0.4, y: -16 },
    animate: { opacity: 1, scale: 1, y: [0, 5, 0] },
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 18,
      delay: 1.0,
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 0.8,
      },
    },
  },
  {
    id: 3,
    className: "absolute top-20 left-6 w-4 h-4 rounded-full bg-primary/70",
    initial: { opacity: 0, scale: 0.4 },
    animate: { opacity: 1, scale: 1, y: [0, -4, 0] },
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 18,
      delay: 1.1,
      y: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 0.4,
      },
    },
  },
  {
    id: 4,
    className: "absolute bottom-16 right-6 w-5 h-5 rounded-full bg-primary",
    initial: { opacity: 0, scale: 0.4, y: 12 },
    animate: { opacity: 1, scale: 1, y: [0, 5, 0] },
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 18,
      delay: 1.2,
      y: {
        duration: 4.4,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 0.6,
      },
    },
  },
];

const InterviewMockup = () => (
  <div className="relative flex h-full min-h-105 w-full items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" as const }}
      className="bg-muted absolute size-85 rounded-full md:size-100"
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: 20, y: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 300,
        damping: 22,
        delay: 0.65,
      }}
      className="bg-primary absolute top-6 right-10 h-14 w-14 rounded-full md:right-16 md:h-16 md:w-16"
    />

    {decorativeBubbles.map((b) => (
      <motion.div
        key={b.id}
        className={b.className}
        initial={b.initial}
        animate={b.animate}
        transition={b.transition}
      />
    ))}

    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring" as const,
        stiffness: 340,
        damping: 28,
        delay: 0.6,
      }}
      whileInView={{ y: -6 }}
      viewport={{ once: false }}
      className="border-border bg-card/90 relative z-10 w-70 rounded-3xl border shadow-lg backdrop-blur-sm md:w-[320px]"
    >
      <motion.div
        variants={cardContainer}
        initial="hidden"
        animate="show"
        className="space-y-4 p-5"
      >
        <motion.div
          variants={cardRow}
          className="flex items-center justify-between"
        >
          <div className="space-y-1.5">
            <motion.div
              variants={shimmer}
              animate="animate"
              className="bg-primary h-2.5 w-24 rounded-full"
            />
            <motion.div
              variants={shimmer}
              animate="animate"
              style={{ animationDelay: "0.3s" }}
              className="bg-secondary/50 h-2 w-32 rounded-full"
            />
          </div>
          <motion.div
            variants={cardRow}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 1.8,
            }}
            className="bg-primary-foreground flex h-8 w-8 items-center justify-center rounded-full"
          >
            <Mic className="text-primary h-3.5 w-3.5" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardRow}
          className="border-muted bg-background space-y-2 rounded-[14px] border p-3.5"
        >
          {[" w-full", "w-5/6", "w-4/6"].map((w, i) => (
            <motion.div
              key={i}
              variants={shimmer}
              animate="animate"
              transition={{ delay: i * 0.25 } as never}
              className={cn("bg-secondary/60 h-2 rounded-full", w)}
            />
          ))}
        </motion.div>

        <motion.div
          variants={cardRow}
          className="border-border bg-card space-y-1.5 rounded-[14px] border p-3"
        >
          {["w-3/4", "w-1/2"].map((w, i) => (
            <motion.div
              key={i}
              variants={shimmer}
              animate="animate"
              transition={{ delay: 0.5 + i * 0.2 } as never}
              className={cn("bg-secondary/50 h-2 rounded-full", w)}
            />
          ))}
        </motion.div>

        <motion.div variants={cardRow} className="flex gap-2">
          {[{ dot: "bg-primary" }, { dot: "bg-secondary" }].map((chip, i) => (
            <div
              key={i}
              className="border-muted bg-accent flex h-6 flex-1 items-center gap-1 rounded-full border px-2"
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", chip.dot)} />
              <motion.div
                variants={shimmer}
                animate="animate"
                className="bg-muted h-1.5 flex-1 rounded-full"
              />
            </div>
          ))}
        </motion.div>

        <motion.div variants={cardRow} className="flex items-center gap-2 pt-1">
          <div className="bg-primary flex h-8 flex-1 items-center justify-center gap-1 rounded-[10px]">
            <div className="bg-primary-foreground/40 h-2 w-16 rounded-full" />
            <ChevronRight className="text-primary-foreground/60 h-3 w-3" />
          </div>
          <div className="border-muted bg-background h-8 w-20 rounded-[10px] border" />
        </motion.div>
      </motion.div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring" as const,
        stiffness: 380,
        damping: 22,
        delay: 1.4,
      }}
      className="border-border bg-card absolute right-4 bottom-14 z-20 flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-md md:right-8"
    >
      <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 2,
          }}
          className="bg-primary h-2 w-2 rounded-full"
        />
      </div>
      <div className="space-y-1">
        <motion.div
          variants={shimmer}
          animate="animate"
          className="bg-secondary/70 h-1.5 w-14 rounded-full"
        />
        <motion.div
          variants={shimmer}
          animate="animate"
          className="bg-secondary/40 h-1.5 w-10 rounded-full"
        />
      </div>
    </motion.div>
  </div>
);

const Home = () => {
  return (
    <section className="grid min-h-screen grid-cols-1 items-center gap-8 py-16 md:grid-cols-2">
      <div className="flex flex-col items-start">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-max"
        >
          <Badge
            variant="default"
            className="mb-5 flex items-center rounded-full px-3 py-2 font-sans text-sm"
          >
            <Dot className="text-primary-foreground -ml-1 size-10" />
            10+ interviews conducted
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            duration: 0.4,
            ease: "easeOut" as const,
          }}
          whileInView={{ y: -6 }}
          viewport={{ once: false }}
          className="text-foreground text-left text-5xl leading-[1.15] font-bold tracking-tight md:text-6xl"
        >
          Ace your next interview —{" "}
          <span className="text-primary font-serif italic">
            with confidence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-muted-foreground mt-4 max-w-sm text-left font-sans text-base leading-relaxed"
        >
          Personalized practice, real-time feedback, and expert guidance. Built
          for humans who get nervous, not robots who don't.
        </motion.p>

        <div className="mt-6 flex gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <Button className="rounded-xl px-5" variant="outline">
              <Link href='/sign-up' className="inline-flex items-center gap-2">
                Get started free
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            <Button className="rounded-xl px-5" variant="default">
              <Link href='/help' className="inline-flex items-center gap-2">
                Learn more
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="mt-7 inline-flex items-center gap-3">
          <motion.div
            className="flex"
            variants={avatarContainer}
            initial="hidden"
            animate="show"
          >
            {userAvatars.map((user, index) => (
              <motion.div
                key={user.initials}
                variants={avatarItem}
                className={index !== 0 ? "-ml-2" : ""}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                style={{ position: "relative" }}
              >
                <Avatar className="border-background h-8 w-8 cursor-pointer border-2">
                  <AvatarFallback
                    className={cn("text-[11px] font-semibold", user.colorClass)}
                  >
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="text-muted-foreground text-sm leading-snug"
            variants={textFade}
            initial="hidden"
            animate="show"
          >
            <span className="text-foreground font-semibold">
              10+ candidates
            </span>{" "}
            landed their dream role
          </motion.p>
        </div>
      </div>
      <div className="hidden w-full items-center justify-center md:flex">
        <InterviewMockup />
      </div>
    </section>
  );
};

export default Home;
