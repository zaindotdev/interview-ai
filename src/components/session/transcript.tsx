'use client'
import { ScrollArea } from "../ui/scroll-area";
import React, { useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Bot, User } from "lucide-react";

interface Props {
  transcripts: {
    role: string;
    transcript: string;
  }[];
  liveTranscription: string
}
const Transcript = ({ transcripts, liveTranscription }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollBy({ top: bottomRef.current.scrollHeight, behavior: "smooth" });
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
      <Card className="h-max w-full rounded-xl p-4 mt-4">
        <ScrollArea className="h-[40vh]">
          {!transcripts.length ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No transcript available
              </p>
            </div>
          ) : (
            <div className="h-60">
              {transcripts.map((transcript, idx) => (
                <div
                  key={`transcript-${idx}`}
                  className={`flex items-center gap-2 mt-2 ${transcript.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden ${transcript.role === "user" ? "order-2" : "order-1"}`}
                  >
                    {transcript.role === "user" ? (
                      <User className="w-full h-full object-cover" />) : (<Bot className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-xl ${transcript.role === "user" ? "order-2 bg-primary/10 rounded-br-none" : "order-1 bg-gray-100 rounded-bl-none"}`}
                  >
                    <p>{transcript.transcript}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </ScrollArea>
        <p>{liveTranscription}</p>
      </Card>
    </div>
  );
};

export default Transcript;
