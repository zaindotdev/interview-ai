'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from "@/lib/utils";
import { HomeCard } from "@/components/shared/home-card";
import Link from "next/link";
import { motion } from "framer-motion"
import { KeyFeatureCard } from "@/components/shared/keyfeature-card";
import PricingCard from '@/components/shared/pricing-card'

// MouseMoveEvent Interface
interface MouseMoveEvent extends React.MouseEvent<HTMLDivElement, MouseEvent> { }

const howItWorks = [
  {
    title: "Upload Your Resume",
    description:
      "Start by uploading your resume in PDF format. Our AI scans it instantly to understand your skills, experience, and areas of improvement.",
    image: "/images/upload-resume.png", // Suggestion: 📄 + ⬆️ icon or drag-and-drop UI illustration
  },
  {
    title: "Smart Resume Scanning",
    description:
      "Your resume is parsed and analyzed using GPT-4 to tailor interview questions to your job role, experience, and skill set.",
    image: "/images/resume-scan.png", // Suggestion: AI brain + magnifying glass or scanned document
  },
  {
    title: "Schedule Mock Interview",
    description:
      "Pick your preferred role and time slot, and we'll match you with an AI-powered interviewer that simulates a real interview scenario.",
    image: "/images/schedule-interview.png", // Suggestion: calendar with clock and headset
  },
  {
    title: "Real-Time AI Interview",
    description:
      "Interact with a GPT-4 interviewer using WebRTC. Get live questions, instant transcript, and feedback after your session.",
    image: "/images/ai-interview.png", // Suggestion: person talking to chatbot/laptop + waveform
  },
];

const keyFeatures = [
  {
    id: "01",
    title: "AI-Powered Resume Analysis",
    description:
      "Get instant, intelligent feedback on your resume to highlight your strengths and identify gaps before applying.",
    image: "/images/resume-analysis.jpg", // Suggest: magnifying glass over resume icon
  },
  {
    id: "02",
    title: "Role-Specific Interview Preparation",
    description:
      "Customize interview questions based on your target role using our GPT-4 powered prompt engine.",
    image: "/images/role-based.jpg", // Suggest: avatar + role tag icon (e.g., 'Frontend', 'Marketing')
  },
  {
    id: "03",
    title: "Live Mock Interviews (WebRTC)",
    description:
      "Experience real-time interviews with an AI interviewer using video and audio streaming.",
    image: "/images/live-interview.jpg", // Suggest: webcam or video chat icon
  }]


const Home = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });


  const handleMouseMove = (e: MouseMoveEvent) => {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <main className='w-full relative'>
      <section className='hero'>
        <div className='container mx-auto flex flex-col items-center justify-center min-h-screen'>
          <div className={"p-4 md:p-8 lg:p-12"}>
            <div className='max-w-[800px]'>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:text-6xl md:text-4xl text-3xl font-bold text-center leading-tight relative">
                Ace Your Next <span className='text-orange-600 relative'>
                  Interview
                  <span className='relative'>
                    <Image layout='fill' src={"/doodle.png"} alt='doodle' />
                  </span>
                </span>
                <br />
                with <span className="text-orange-600">AI Powered</span> Precision
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: "easeInOut" }} className='lg:text-2xl md:text-xl text-lg font-light text-center mt-4'>
                Practice real-time mock interviews with <span className='text-orange-600 font-bold'>GPT-4</span>, get instant feedback, and impress recruiters before the actual call. Let your resume speak—and prepare like a pro.
              </motion.p>
            </div>
            <div className='mt-8 flex items-center justify-center md:flex-row flex-col lg:gap-4 gap-2'>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: "easeInOut" }}>
                <Button className={cn(
                  "p-6 lg:text-xl md:text-lg text-base",
                )} variant={"primary"}>
                  Get Started for Free <ChevronRight />
                </Button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ease: "easeInOut" }}>
                <Button className={
                  cn(
                    "p-6 lg:text-xl md:text-lg text-base",
                  )
                } variant={"secondary"}>
                  Try Demo <ChevronRight />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id='how-it-works' className={"container mx-auto py-16 p-4 md:p-8 lg:p-12"}>
        <div className={"flex items-center justify-center"}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className={"lg:text-4xl md:text-2xl text-xl font-bold text-center mb-8 text-orange-500 relative w-fit"}>How It Works
            <span className={"w-full h-1 rounded-full bg-orange-600 absolute bottom-[-10px] left-0"}></span>
          </motion.h2>
        </div>
        <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center"}>
          {howItWorks.map((item, index) => (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.2, duration: 0.2, ease: "backOut" }} key={`how-it-works-cards-${index}`} className={"min-h-[2rem]"}>
              <HomeCard title={item.title} description={item.description} action={item.title} image={item.image} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id='demo' className={"container mx-auto py-16 p-4 md:p-8 lg:p-12"}>
        <div className={"flex items-center justify-center"}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className={"lg:text-4xl md:text-2xl text-xl font-bold text-center mb-8 text-orange-500 relative w-fit"}>Try Interview AI Now
            <span className={"w-full h-1 rounded-full bg-orange-600 absolute bottom-[-10px] left-0"}></span>
          </motion.h2>
        </div>
        <div className={"w-full h-full relative"}>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut", delay: 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            className={"md:w-[80%] mx-auto rounded-xl shadow-lg overflow-hidden relative cursor-pointer"}
          >
            <video

              src={"/videos/demo-interview.mp4"}
              width="100%"
              height="100%"
              autoPlay={true}
              muted
              loop
              className="w-full h-auto"
            />
            {/* Overlay button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0,
                x: isHovered ? mousePosition.x - 64 : mousePosition.x, // 64px = half of 128px (w-32)
                y: isHovered ? mousePosition.y - 64 : mousePosition.y, // 64px = half of 128px (h-32)
              }}
              transition={{
                ease: [0, 0.25, 0.45, 1],
                duration: 0.3,
              }}
              className={"bg-orange-600 flex items-center justify-center md:w-32 md:h-32 w-16 h-16 absolute top-0 left-0 rounded-full text-center text-white font-semibold shadow-lg hover:bg-orange-700 transition-colors pointer-events-none"}
            >
              <Link href={"/"} className="text-sm pointer-events-auto">
                Try Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id='features' className={"container mx-auto py-16 p-4 md:p-8 lg:p-12"}>
        <div className={"flex items-center justify-center"}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeInOut" }} className={"lg:text-4xl md:text-2xl text-xl font-bold text-center mb-8 text-orange-500 relative w-fit"}>Key Features
            <span className={"w-full h-1 rounded-full bg-orange-600 absolute bottom-[-10px] left-0"}></span>
          </motion.h2>
        </div>
        <div className={""}>
          <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 place-items-center gap-4"}>
            {keyFeatures.map((item, index) => (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.2, duration: 0.2, ease: "backOut" }} key={`key-feature-cards-${index}`} className={"min-h-[2rem]"}>
                <KeyFeatureCard id={item.id} title={item.title} description={item.description} image={item.image} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id='pricing'>
        <PricingCard/>
      </section>
    </main>
  )
}

export default Home