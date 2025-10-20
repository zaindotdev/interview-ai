<<<<<<< HEAD
"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: string
  transcript: string
}

interface TranscriptProps {
  liveTranscription: string
  transcripts: Message[]
}

const Transcript = ({ liveTranscription, transcripts }: TranscriptProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [transcripts, liveTranscription])

  const formatTimestamp = (index: number) => {
    const now = new Date()
    const time = new Date(now.getTime() - (transcripts.length - index) * 30000)
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="h-[600px] flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-4 p-4">
          {transcripts.length === 0 && !liveTranscription && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Transcript will appear here once the conversation starts...</p>
=======
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: string;
  transcript: string;
}

interface TranscriptProps {
  liveTranscription: string;
  transcripts: Message[];
}

const Transcript = ({ liveTranscription, transcripts }: TranscriptProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcripts, liveTranscription]);

  const formatTimestamp = (index: number) => {
    const now = new Date();
    const time = new Date(now.getTime() - (transcripts.length - index) * 30000);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea ref={scrollAreaRef} className="h-full flex-1 pr-4">
        <div className="space-y-4 p-4">
          {transcripts.length === 0 && !liveTranscription && (
            <div className="text-muted-foreground flex h-32 items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">
                  Transcript will appear here once the conversation starts...
                </p>
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
              </div>
            </div>
          )}

          {transcripts.map((message, index) => (
            <div
              key={index}
              className={cn(
<<<<<<< HEAD
                "flex gap-3 p-3 rounded-lg",
                message.role === "assistant"
                  ? "bg-primary/5 border border-primary/10"
                  : "bg-muted/50 border border-border",
=======
                "flex gap-3 rounded-lg p-3",
                message.role === "assistant"
                  ? "bg-primary/5 border-primary/10 border"
                  : "bg-muted/50 border-border border",
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs",
<<<<<<< HEAD
                    message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {message.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground capitalize">
                    {message.role === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(index)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{message.transcript}</p>
=======
                    message.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-foreground text-xs font-medium capitalize">
                    {message.role === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatTimestamp(index)}
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed">
                  {message.transcript}
                </p>
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
              </div>
            </div>
          ))}

          {liveTranscription && (
<<<<<<< HEAD
            <div className="flex gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">You</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">Speaking...</span>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed opacity-75">{liveTranscription}</p>
=======
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800/30 dark:bg-yellow-950/20">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-yellow-100 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-foreground text-xs font-medium">
                    You
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 animate-bounce rounded-full bg-yellow-500" />
                    <div className="h-1 w-1 animate-bounce rounded-full bg-yellow-500 [animation-delay:0.1s]" />
                    <div className="h-1 w-1 animate-bounce rounded-full bg-yellow-500 [animation-delay:0.2s]" />
                    <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                      Speaking...
                    </span>
                  </div>
                </div>
                <p className="text-foreground text-sm leading-relaxed opacity-75">
                  {liveTranscription}
                </p>
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
<<<<<<< HEAD
  )
}

export default Transcript
=======
  );
};

export default Transcript;
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
