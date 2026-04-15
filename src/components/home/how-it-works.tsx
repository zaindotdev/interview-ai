"use client";
import React from "react";
import { motion } from "motion/react";

const steps = [
  {
    number: "1",
    title: "Tell us your target",
    desc: "Set your role, industry, and seniority. Upload your CV for a fully tailored experience.",
  },
  {
    number: "2",
    title: "Practice out loud",
    desc: "Talk through real questions. The AI listens, adapts, and gives you honest feedback.",
  },
  {
    number: "3",
    title: "Refine and repeat",
    desc: "Review your recordings, track your growth, and walk into the real thing knowing you're ready.",
  },
];

const HowItWorks = () => {
  return (
    <section id='how-it-works' className="mb-20 px-4">
      {/* Headings */}
      <motion.h3 className="text-center text-xl uppercase tracking-wide">
        How It Works
      </motion.h3>

      <motion.h2 className="mt-2 text-center text-3xl sm:text-4xl font-bold">
        Three steps to showing up ready
      </motion.h2>

      {/* Timeline */}
      <div className="relative mx-auto mt-16 max-w-4xl">
        
        {steps.map((step, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={index} className="relative mb-16">
              
              {/* Center Circle */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/30 font-semibold"
                >
                  {step.number}
                </motion.div>
              </div>

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className={`
                  mt-4 w-[85%] rounded-xl bg-white/5 p-5 shadow
                  ${isLeft ? "mr-auto text-left" : "ml-auto text-left"}
                  sm:w-[45%]
                  sm:${isLeft ? "mr-auto pr-8" : "ml-auto pl-8"}
                `}
              >
                <h4 className="font-semibold text-lg">{step.title}</h4>
                <p className="text-sm mt-2 text-muted-foreground">
                  {step.desc}
                </p>
              </motion.div>

              {/* Line */}
              {index !== steps.length - 1 && (
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ originY: 0 }}
                    className="my-4 h-16 w-px bg-primary/30"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;