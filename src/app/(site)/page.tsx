"use client"

import React from "react";
import { motion } from "framer-motion"
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

import Container from "@/components/shared/container";
import HeadingContainer from "@/components/shared/heading-container"
import { HowItWorks, KeyFeaturesData, PricingPlans } from "@/lib/types";
import PricingCard from "@/components/shared/pricing-card";

const howItWorksData: HowItWorks[] = [
  {
    index: "01",
    title: "Upload Your Resume",
    description: "Start by uploading your resume. Our AI instantly analyzes it, highlights strengths, and suggests improvements.",
  },
  {
    index: "02",
    title: "Select Your Target Role",
    description: "Choose the role you're applying for and get customized interview questions tailored to that position using GPT-4.",

  },
  {
    index: "03",
    title: "Start Mock Interview",
    description: "Engage in a live mock interview with an AI interviewer via WebRTC, including real-time video and audio feedback.",
  }
];

const keyFeaturesData: KeyFeaturesData[] = [
  {
    index: "01",
    title: "Real-time Feedback",
    description: "Get instant feedback on your responses, body language, and communication style during mock interviews.",
  },
  {
    index: "02",
    title: "AI-Powered Analysis",
    description: "Advanced AI algorithms analyze your performance and provide detailed insights for improvement.",
  },
  {
    index: "03",
    title: "Custom Interview Questions",
    description: "Practice with industry-specific questions tailored to your target role and experience level.",
  },
  {
    index: "04",
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed analytics and performance metrics.",
  }
];

const pricingPlans: PricingPlans[] = [
  {
    title: "Free",
    description: "Perfect for individuals and small projects getting started.",
    price: "$0/mo",
    features: [
      "1 Resume Analysis per Month",
      "Basic Role-Specific Interview Questions",
      "1 AI Mock Interview per Week",
      "Standard Feedback Summary",
      "Access to Demo Video",
      "Limited Progress Tracking",
      "Email Support"
    ],
    buttonText: "Get Started",
    buttonLink: "/signup/basic",
    tier: "basic" as const,
  },
  {
    title: "Pro",
    description: "Ideal for growing businesses and professional teams.",
    price: "$29/mo",
    originalPrice: "$39/mo",
    features: [
      "Unlimited Resume Analysis",
      "Full Role-Specific Question Library",
      "Unlimited AI Mock Interviews (WebRTC)",
      "Detailed Interview Feedback & Reports",
      "Video Recording & Playback",
      "Downloadable PDF Reports",
      "Custom Role & Company-Based Prompts",
      "Full Progress Analytics & History",
      "Priority Support"
    ],
    buttonText: "Start Pro Trial",
    buttonLink: "/signup/pro",
    tier: "pro" as const,
    popular: true,
  },
  {
    title: "Enterprise",
    description: "Comprehensive solution for large organizations.",
    price: "$99/mo",
    features: [
      "Multi-user Team Access",
      "Unlimited Resume Analysis",
      "Unlimited AI Mock Interviews",
      "Custom-Branded Dashboard",
      "Company-Specific Prompts & Roles",
      "Dedicated Account Manager",
      "Team Performance Analytics",
      "Exportable Feedback Reports",
      "ATS & LMS Integrations",
      "Role-Based Access Controls",
      "API Access",
      "24/7 Priority Support"
    ],
    buttonText: "Contact Sales",
    buttonLink: "/contact/enterprise",
    tier: "enterprise" as const,
    badge: "Best Value",
  },
]

const Landing = () => {
  return <Container>
    {/* Hero Section */}
    <section id={"home"} className={"w-full min-h-screen flex items-center justify-center"}>
      <HeadingContainer>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "linear" }}
          className="text-3xl md:text-6xl font-bold text-center bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent"
        >
          Ace your next interview with AI powered precision.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
          className="mt-6 text-base md:text-xl/8 text-center text-gray-600"
        >
          Get personalized interview preparation with real-time feedback, custom practice sessions, and expert guidance
          powered by advanced AI technology.
        </motion.p>
        <div className={"mt-10 md:flex items-center justify-center gap-4 mx-auto w-fit"}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={""}>
            <Link href={"/sign-in"}><Button variant={"primary"} className={"text-base md:text-lg cursor-pointer"}>
              Get Started
            </Button></Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: "linear" }} className={"mt-4 md:mt-0"}>
            <Link href={'#demo'}>
              <Button variant={"secondary"} className={"text-base md:text-lg cursor-pointer"}>
                Live Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </HeadingContainer>
    </section>
    {/*  How It Works Section */}
    <section id={'how-it-works'} className={"w-full py-24"}>
      <HeadingContainer>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "linear" }} className={"text-center text-orange-600 font-medium text-base/8 md:text-lg/8"}>
          How it works
        </motion.h2>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={"text-2xl/8 md:text-5xl text-center font-semibold mt-4"}>
          Master Your Interview Skills with Our AI-Powered Platform
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={"mt-6 text-base md:text-xl/8 text-center font-medium text-gray-600"}>
          Our AI platform simulates interviews, providing real-time feedback on responses, body language, and
          communication.
          Practice with industry-specific questions and get detailed analytics to improve after each session.
        </motion.p>
      </HeadingContainer>
      <div className={"w-full mt-8"}>
        <div className={"w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {howItWorksData.map((data, index) => (
            <motion.div key={`how-it-works-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.5, ease: "linear" }} className={"w-full"}>
              <Card className={"max-w-xl bg-inherit"}>
                <CardHeader className={"flex items-center justify-center gap-4"}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={'size-24 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center'}>
                    <h1 className={"text-white text-2xl/8 font-bold"}>
                      {data.index}
                    </h1>
                  </motion.div>
                  <CardTitle>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }} className={"text-xl md:text-2xl/8 font-bold text-orange-500"}>
                      {data.title}
                    </motion.h1>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={"max-w-md mx-auto text-center text-base md:text-lg/8 text-gray-600"}>{data.description}</motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    {/* Demo Section */}
    <section className={"w-full py-24"} id={"demo"}>
      <HeadingContainer>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "linear" }} className={"text-center text-orange-600 font-medium text-base/8 md:text-lg/8"}>
          Live Demo
        </motion.h2>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={"text-2xl/8 md:text-5xl text-center font-semibold mt-4"}>
          Experience the power of our <br />AI-powered platform
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "linear" }}
          className={"mt-6 text-base md:text-xl/8 text-center font-medium text-gray-600"}>
          Watch our AI interviewer in action as it conducts a mock interview session. Experience real-time feedback,
          natural conversation flow, and professional assessment capabilities that help you prepare for your next big
          opportunity.
        </motion.p>
      </HeadingContainer>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={"mt-8 rounded-xl overflow-hidden max-w-4xl mx-auto"}>
        <video src={"/videos/demo-interview.mp4"} autoPlay={true} loop={true} muted={true} playsInline={true} />
      </motion.div>
    </section>
    {/*  Key Features Section */}
    <section id={"features"}>
      <HeadingContainer>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "linear" }} className={"text-center text-orange-600 font-medium text-base/8 md:text-lg/8"}>
          Key Features
        </motion.h2>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={"text-2xl/8 md:text-5xl text-center font-semibold mt-4"}>
          Our platform has everything you need to succeed
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={"mt-6 text-base md:text-xl/8 text-center font-medium text-gray-600"}>
          From personalized feedback to advanced analytics, our platform offers comprehensive tools to enhance your
          interview performance. Practice with industry-specific questions, receive instant evaluations, and track
          your progress over time.
        </motion.p>
      </HeadingContainer>
      <div className={"w-full my-8"}>
        <ul className={"grid grid-cols-1 md:grid-cols-2 gap-8"}>
          {keyFeaturesData.map((data, index) => (
            <motion.li key={`key-features-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.2, ease: "linear" }} className={"flex items-center gap-4 md:border-b-0 border-b-2 p-2"}>
              <div className={"size-16 rounded-full bg-orange-500 flex items-center justify-center"}>
                <h1 className={"text-white text-2xl/8 font-bold"}>
                  {data.index}
                </h1>
              </div>
              <div className={"flex-1"}>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={"text-orange-500 font-bold text-xl/8 text-pretty"}>
                  {data.title}
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6, ease: "linear" }} className={"mt-1 text-gray-600 text-base"}>
                  {data.description}
                </motion.p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
    {/*  Pricing Section */}
    <section id={"pricing"} className={"w-full py-24"}>
      <HeadingContainer>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "linear" }} className={"text-center text-orange-600 font-medium text-base/8 md:text-lg/8"}>
          Pricing
        </motion.h2>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "linear" }} className={"text-2xl/8 md:text-5xl text-center font-semibold mt-4"}>
          Choose the plan that works best for you
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4, ease: "linear" }} className={"mt-6 text-base md:text-xl/8 text-center font-medium text-gray-600"}>
          Looking to take your interview skills to the next level? Our platform offers comprehensive tools tailored
          for success. Experience AI-powered practice sessions with industry-specific questions, get instant feedback,
          and monitor your growth with detailed performance analytics.
        </motion.p>
      </HeadingContainer>
      <div className={"max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-items-center gap-6 mt-8"}>
        {pricingPlans.map((data, index) => (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.2, ease: "linear" }} key={`pricing-${index}`} className={"w-full mx-auto mt-8"}>
            <PricingCard key={data.title} {...data} />
          </motion.div>
        ))}
      </div>
    </section>
  </Container>
}

export default Landing;