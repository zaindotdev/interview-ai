"use client"

import type React from "react"
import type { ReactElement } from "react"
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

interface SessionCardProps {
  name: string
  avatar: ReactElement
  isSpeaking: boolean // New prop to control the wave animation
}

const SessionCard: React.FC<SessionCardProps> = ({ avatar, name, isSpeaking }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <h1 className="from-primary/70 to-primary/80 bg-gradient-to-b bg-clip-text text-xl font-bold text-transparent">
            {name}
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="relative flex items-center justify-center w-24 h-24">
          {" "}
          {/* Container for avatar and wave */}
          {avatar}
          {isSpeaking && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30" // Subtle blue for the wave
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "easeOut",
              }}
              aria-hidden="true" // Decorative element for accessibility
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionCard
