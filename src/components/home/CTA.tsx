"use client";
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const CTA = () => {
  const router = useRouter();
  return (
    <section className="mb-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center font-sans text-7xl font-bold"
      >
        Stop dreading interviews.
      </motion.h1>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-primary mt-4 text-center font-serif text-6xl font-bold"
      >
        Start owning them.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4 text-center text-xl"
      >
        Free to start. No credit card needed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button onClick={()=>router.push("/sign-up")} className="mx-auto mt-8 flex items-center" size="lg">
          Get Started Free <ArrowRight className="ml-2" />
        </Button>
      </motion.div>
    </section>
  );
};

export default CTA;
