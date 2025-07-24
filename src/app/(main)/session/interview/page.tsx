"use client";
import {
  Card,
  CardTitle,
  CardAction,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Bot, PhoneIcon, User } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Vapi from "@vapi-ai/web";
import Transcript from "@/components/session/transcript";

type Message = {
  role: string;
  transcript: string;
};

const Interview = () => {
  const [scope, animate] = useAnimate();
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  const vapiRef = useRef<Vapi | null>(null);
  const messageHandlerRef = useRef<((message: any) => void) | null>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_AI_API_KEY!);
    }

    const vapi = vapiRef.current;

    if (messageHandlerRef.current) {
      vapi.off("message", messageHandlerRef.current);
    }

    const handleMessage = (message: any) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        console.log(`${role}: ${transcript}`);

        if (transcriptType === "partial") {
          setCurrentRole(role);
          setCurrentTranscript(transcript);
        } else if (transcriptType === "final") {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === role && lastMessage.transcript === transcript) {
              return prev;
            }
            return [...prev, { role, transcript }];
          });
          setCurrentRole(null);
          setCurrentTranscript("");
        }
      }
    };

    messageHandlerRef.current = handleMessage;
    vapi.on("message", handleMessage);

    const handleCallStart = () => {
      console.log("Call Initiated");
      setCallStarted(true);
    };

    const handleCallEnd = () => {
      console.log("Call Ended");
      setCallStarted(false);
      setCurrentRole(null);
      setCurrentTranscript("");
    };

    vapi.on('call-start', handleCallStart);
    vapi.on("call-end", handleCallEnd);

    return () => {
      if (vapi && messageHandlerRef.current) {
        vapi.off("message", messageHandlerRef.current);
        vapi.off('call-start', handleCallStart);
        vapi.off("call-end", handleCallEnd);
      }
    };
  }, []);

  const startCall = async () => {
    try {
      if (vapiRef.current) {
        await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_API_KEY!);
      }
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setCallStarted(false);
    setCurrentRole(null);
    setCurrentTranscript("");
  };

  return (
    <main>
      <section className="p-4 flex items-center justify-center flex-wrap md:flex-nowrap gap-4">
        <Card className="w-full md:w-1/2 h-96">
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl md:text-2xl/8 text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                Assistant
              </h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardContent>
              <motion.div
                ref={scope}
                className="w-full h-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={callStarted && currentRole === "assistant" ?
                    { scale: [1, 1.2, 1] } :
                    { scale: [1, 1.05, 1] }
                  }
                  transition={{
                    duration: callStarted && currentRole === "assistant" ? 0.5 : 0.8,
                    ease: "linear",
                    delay: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="size-54 flex items-center justify-center bg-orange-100 rounded-full"
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={callStarted && currentRole === "assistant" ?
                      { scale: [1, 1.2, 1] } :
                      { scale: [1, 1.05, 1] }
                    }
                    transition={{
                      duration: callStarted && currentRole === "assistant" ? 0.5 : 0.8,
                      ease: "linear",
                      delay: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="size-48 flex items-center justify-center bg-orange-200 rounded-full"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={callStarted && currentRole === "assistant" ?
                        { scale: [1, 1.2, 1] } :
                        { scale: [1, 1.05, 1] }
                      }
                      transition={{
                        duration: callStarted && currentRole === "assistant" ? 0.5 : 0.8,
                        ease: "linear",
                        delay: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="size-40 flex items-center justify-center bg-orange-300 rounded-full"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={callStarted && currentRole === "assistant" ?
                          { scale: [1, 1.2, 1] } :
                          { scale: [1, 1.05, 1] }
                        }
                        transition={{
                          duration: callStarted && currentRole === "assistant" ? 0.5 : 0.8,
                          ease: "linear",
                          delay: 1.0,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="size-32 flex items-center justify-center bg-orange-400 rounded-full"
                      >
                        <Bot
                          className="size-16 text-white"
                          strokeWidth={1.25}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </CardContent>
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/2 h-96">
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl md:text-2xl/8 text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
                You
              </h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardContent>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={callStarted && currentRole === "user" ?
                  { scale: [1, 1.2, 1] } :
                  { scale: [1, 1.05, 1] }
                }
                transition={{
                  duration: callStarted && currentRole === "user" ? 0.5 : 0.8,
                  ease: "linear",
                  delay: 0.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-full h-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={callStarted && currentRole === "user" ?
                    { scale: [1, 1.2, 1] } :
                    { scale: [1, 1.05, 1] }
                  }
                  transition={{
                    duration: callStarted && currentRole === "user" ? 0.5 : 0.8,
                    ease: "linear",
                    delay: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="size-54 flex items-center justify-center bg-orange-100 rounded-full"
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={callStarted && currentRole === "user" ?
                      { scale: [1, 1.2, 1] } :
                      { scale: [1, 1.05, 1] }
                    }
                    transition={{
                      duration: callStarted && currentRole === "user" ? 0.5 : 0.8,
                      ease: "linear",
                      delay: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="size-48 flex items-center justify-center bg-orange-200 rounded-full"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={callStarted && currentRole === "user" ?
                        { scale: [1, 1.2, 1] } :
                        { scale: [1, 1.05, 1] }
                      }
                      transition={{
                        duration: callStarted && currentRole === "user" ? 0.5 : 0.8,
                        ease: "linear",
                        delay: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="size-40 flex items-center justify-center bg-orange-300 rounded-full"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={callStarted && currentRole === "user" ?
                          { scale: [1, 1.2, 1] } :
                          { scale: [1, 1.05, 1] }
                        }
                        transition={{
                          duration: callStarted && currentRole === "user" ? 0.5 : 0.8,
                          ease: "linear",
                          delay: 1.0,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="size-32 flex items-center justify-center bg-orange-400 rounded-full"
                      >
                        <User
                          className="size-16 text-white"
                          strokeWidth={1.25}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </CardContent>
          </CardContent>
        </Card>
      </section>
      <section className="action-buttons">
        <div className="flex items-center justify-center gap-4">
          {!callStarted ? (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  asChild
                  onClick={startCall}
                  className="cursor-pointer"
                  variant={"default"}
                >
                  <PhoneIcon size={24} color="white"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Call</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={endCall}
              className="cursor-pointer"
              size={"lg"}
              variant={"destructive"}
            >
              <Tooltip>
                <TooltipTrigger>
                  <PhoneIcon className="rotate-[135deg]" />
                </TooltipTrigger>
                <TooltipContent>End Call</TooltipContent>
              </Tooltip>
            </Button>
          )}
        </div>
      </section>
      <Transcript
        transcripts={messages}
      />
    </main>
  );
};

export default Interview;