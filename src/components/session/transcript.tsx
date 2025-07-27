"use client"

import { ScrollArea } from "../ui/scroll-area"
import { useEffect, useRef } from "react"
import { Card } from "../ui/card"
import { Bot, User, Mic } from "lucide-react"

interface Props {
  transcripts: {
    role: string
    transcript: string
  }[]
  liveTranscription: string
}

const Transcript = ({ transcripts, liveTranscription }: Props) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [transcripts, liveTranscription])

  return (
    <div className="mr-auto w-full">
      <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
        Transcript
      </h2>

      <Card className="w-full rounded-xl p-4 mt-4">
        {/* Live Transcription at the top */}

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Transcription</span>
            </div>
            {liveTranscription?<p className="text-sm text-blue-800 dark:text-blue-200 italic">{liveTranscription}</p>:<p className="text-sm text-blue-800 dark:text-blue-200 italic">No live transcription available</p>}
          </div>

        <ScrollArea className="h-[40vh]" ref={scrollAreaRef}>
          {!transcripts.length ? (
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No transcript available</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start speaking to see the conversation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {transcripts.map((transcript, idx) => (
                <div
                  key={`transcript-${idx}`}
                  className={`flex items-start gap-3 ${transcript.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${transcript.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {transcript.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${transcript.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-muted-foreground rounded-tl-sm"
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{transcript.transcript}</p>
                  </div>
                </div>
              ))}

              {/* Invisible element to scroll to */}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}

export default Transcript
