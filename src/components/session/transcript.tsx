import { ScrollArea } from "../ui/scroll-area";
import React, { useRef } from "react";
import { Card } from "../ui/card";
import { Bot } from "lucide-react";

interface Props {
  transcripts: {
    role: string;
    transcript: string;
  }[];
}
const Transcript = ({ transcripts }: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if(bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }
  return (
    <div className="mr-auto w-full">
      <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
        Transcript
      </h2>
      <Card className="h-max w-full rounded-xl p-4 mt-4">
        <ScrollArea className="h-[40vh]">
          <div className="h-60">
            {transcripts.map((transcript, idx) => (
              <div
                key={`transcript-${idx}`}
                className={`flex items-center gap-2 mt-2 ${transcript.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden ${transcript.role === "user" ? "order-2" : "order-1"}`}
                >
                  <Bot className="w-full h-full"/>
                </div>
                <div
                  className={`p-2 rounded-xl ${transcript.role === "user" ? "order-2 bg-primary/10 rounded-br-none" : "order-1 bg-gray-100 rounded-bl-none"}`}
                >
                  <p>{transcript.transcript}</p>
                </div>
              </div>
            ))}
          </div>
          <div ref={bottomRef}/>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Transcript;
