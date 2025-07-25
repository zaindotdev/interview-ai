"use client";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Bot, Circle, PhoneIcon, User } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Vapi from "@vapi-ai/web";
import Transcript from "@/components/session/transcript";
import axios from 'axios'
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  role: string;
  transcript: string;
};

type ConnectionStatus = 
  | "Initializing..." 
  | "Microphone access granted" 
  | "Microphone permission denied. Please allow microphone access."
  | "Starting call..."
  | "Call active - You can speak now"
  | "Listening..."
  | "Call ended"
  | string; // for error messages

const INTERVIEW_CONFIG = {
  topic: "JS Mastery",
  description: "This interview will test your knowledge of advanced JavaScript concepts, including closures, async/await, and ES6 features.",
  focus: ["closures", "async/await", "ES6 features"],
  estimated_time: "15min",
  difficulty: "easy",
} as const;

// Memoized animation variants to prevent re-creation
const createAnimationVariants = (isActive: boolean) => ({
  initial: { scale: 0.95 },
  animate: isActive 
    ? { scale: [1, 1.2, 1] }
    : { scale: [1, 1.05, 1] },
  transition: {
    duration: isActive ? 0.5 : 0.8,
    ease: "linear" as const,
    repeat: Infinity,
    repeatType: "reverse" as const,
  }
});

// Memoized Avatar Component
const Avatar = React.memo<{ 
  type: 'assistant' | 'user'; 
  isActive: boolean; 
  callStarted: boolean;
}>(({ type, isActive, callStarted }) => {
  const colors = type === 'assistant' 
    ? ['bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400']
    : ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400'];
  
  const Icon = type === 'assistant' ? Bot : User;
  const variants = useMemo(() => createAnimationVariants(callStarted && isActive), [callStarted, isActive]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {[54, 48, 40, 32].map((size, index) => (
        <motion.div
          key={size}
          {...variants}
          transition={{
            ...variants.transition,
            delay: 0.4 + (index * 0.2),
          }}
          className={`size-${size} flex items-center justify-center ${colors[index]} rounded-full ${index === 0 ? '' : 'absolute'}`}
        >
          {index === 3 && (
            <Icon className="size-16 text-white" strokeWidth={1.25} />
          )}
        </motion.div>
      ))}
    </div>
  );
});

Avatar.displayName = 'Avatar';

const Interview = () => {
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("Initializing...");
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean>(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const vapiRef = useRef<Vapi | null>(null);
  const messageHandlerRef = useRef<((message: any) => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Memoized assistant data validation
  const isValidTopic = useMemo(() => INTERVIEW_CONFIG.topic === id, [id]);

  const getAssistantId = useCallback(async () => {
    if (!isValidTopic) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/assistant', {
        data: INTERVIEW_CONFIG
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log(response.data.data.assistant);
      setAssistantId(response.data.data.assistant.id);
    } catch (error) {
      console.error('Failed to get assistant ID:', error);
      setConnectionStatus("Failed to initialize assistant");
    } finally {
      setLoading(false);
    }
  }, [isValidTopic]);

  // Memoized microphone permission handler
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAccess(true);
      setConnectionStatus("Microphone access granted");
      // Stop the stream as we just needed permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicrophoneAccess(false);
      setConnectionStatus("Microphone permission denied. Please allow microphone access.");
      return false;
    }
  }, []);

  // Optimized message handler with better duplicate prevention
  const createMessageHandler = useCallback(() => {
    return (message: any) => {
      switch (message.type) {
        case "transcript": {
          const { role, transcriptType, transcript } = message;
          console.info(`${role}: ${transcript}`);

          if (transcriptType === "partial") {
            setCurrentRole(role);
            setCurrentTranscript(transcript);
          } else if (transcriptType === "final") {
            setMessages((prev) => {
              // More robust duplicate checking
              const isDuplicate = prev.some(msg => 
                msg.role === role && 
                msg.transcript === transcript
              );
              
              if (isDuplicate) return prev;
              
              return [...prev, { role, transcript }];
            });
            setCurrentRole(null);
            setCurrentTranscript("");
          }
          break;
        }
        case "speech-start":
          console.info("Speech started by:", message.role || "user");
          setCurrentRole(message.role || "user");
          setConnectionStatus("Listening...");
          break;
        case "speech-end":
          console.info("Speech ended");
          setCurrentRole(null);
          break;
      }
    };
  }, []);

  // Memoized event handlers
  const handleCallStart = useCallback(() => {
    console.info("Call Initiated");
    setCallStarted(true);
    setConnectionStatus("Call active - You can speak now");
  }, []);

  const handleCallEnd = useCallback(() => {
    console.info("Call Ended");
    setCallStarted(false);
    setCurrentRole(null);
    setCurrentTranscript("");
    setConnectionStatus("Call ended");
  }, []);

  const handleError = useCallback((error: any) => {
    console.error("Vapi error:", error);
    setConnectionStatus(`Error: ${error.message || "Connection failed"}`);
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setCallStarted(false);
    setCurrentRole(null);
    setCurrentTranscript("");
    router.replace("/dashboard");
  }, [router]);

  // Initialize assistant ID
  useEffect(() => {
    getAssistantId();
  }, [getAssistantId]);

  // Main Vapi initialization effect
  useEffect(() => {
    if (!assistantId || loading) return;

    const initializeVapi = async () => {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      // Initialize Vapi instance only once
      if (!vapiRef.current) {
        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_AI_API_KEY!);
      }

      const vapi = vapiRef.current;

      // Clean up existing handlers
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Create and register new handlers
      const messageHandler = createMessageHandler();
      messageHandlerRef.current = messageHandler;

      vapi.on("message", messageHandler);
      vapi.on("call-start", handleCallStart);
      vapi.on("call-end", handleCallEnd);
      vapi.on("error", handleError);

      // Store cleanup function
      cleanupRef.current = () => {
        vapi.off("message", messageHandler);
        vapi.off("call-start", handleCallStart);
        vapi.off("call-end", handleCallEnd);
        vapi.off("error", handleError);
      };

      // Auto-start call
      try {
        console.info("Auto-starting call...");
        setConnectionStatus("Starting call...");
        await vapi.start(assistantId);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error auto-starting call:", error);
          setConnectionStatus(`Failed to start call: ${error.message || "Unknown error"}`);
        }
      }
    };

    initializeVapi();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [assistantId, loading, requestMicrophonePermission, createMessageHandler, handleCallStart, handleCallEnd, handleError]);

  // Memoized status indicator
  const statusColor = useMemo(() => {
    if (!microphoneAccess) return "text-red-600";
    return callStarted ? "text-green-600" : "text-orange-600";
  }, [microphoneAccess, callStarted]);

  const statusCircleColor = useMemo(() => {
    if (!microphoneAccess) return "text-red-600";
    return callStarted ? "text-green-600" : "text-orange-600";
  }, [microphoneAccess, callStarted]);

  return (
    <main>
      <section className="p-4">
        <div className="flex items-center justify-start">
          <div className="flex items-center gap-2 text-center border ring-2 ring-primary p-4 rounded-xl text-wrap">
            <Circle size={20} className={statusCircleColor} />
            <p className={`text-lg font-medium ${statusColor}`}>
              {connectionStatus}
            </p>
            {!microphoneAccess && (
              <p className="text-sm text-gray-600 mt-2">
                Please refresh the page and allow microphone access when prompted.
              </p>
            )}
          </div>
        </div>
      </section>

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
            <Avatar 
              type="assistant" 
              isActive={currentRole === "assistant"} 
              callStarted={callStarted}
            />
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
            <Avatar 
              type="user" 
              isActive={currentRole === "user"} 
              callStarted={callStarted}
            />
          </CardContent>
        </Card>
      </section>

      <section className="action-buttons">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={endCall}
            className="cursor-pointer"
            size="lg"
            variant="destructive"
          >
            <Tooltip>
              <TooltipTrigger>
                <PhoneIcon className="rotate-[135deg]" />
              </TooltipTrigger>
              <TooltipContent>End Call</TooltipContent>
            </Tooltip>
          </Button>
        </div>
      </section>

      <Transcript
        transcripts={messages}
        liveTranscription={currentTranscript}
      />
    </main>
  );
};

export default Interview;