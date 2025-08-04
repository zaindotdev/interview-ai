"use client";
import type { ReactElement } from "react";
import React from "react";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { PhoneIcon, Circle, Bot, User, TimerIcon, Mic } from "lucide-react";
import Vapi from "@vapi-ai/web";
import Transcript from "@/components/session/transcript";
import Timer from "@/components/session/timer";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { PracticeInterview } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  | "Time up - Call ended"
  | string;

// Helper for avatar animation variants
const createAnimationVariants = (isActive: boolean) => ({
  initial: { scale: 0.95, opacity: 1 },
  animate: isActive
    ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } // More pronounced scale and subtle opacity pulse when active
    : { scale: [1, 1.02, 1], opacity: 1 }, // Very subtle scale when inactive, no opacity change
  transition: {
    duration: isActive ? 0.6 : 1.2, // Slightly longer duration for inactive, shorter for active
    ease: "easeInOut" as const, // Use easeInOut for smoother pulse
    repeat: Number.POSITIVE_INFINITY,
    repeatType: "reverse" as const,
  },
});

// Memoized Avatar component for performance
const AnimatedAvatar = React.memo<{
  type: "assistant" | "user";
  isActive: boolean;
  callStarted: boolean;
}>(({ type, isActive, callStarted }) => {
  const colors =
    type === "assistant"
      ? ["bg-orange-100", "bg-orange-200", "bg-orange-300", "bg-orange-400"]
      : ["bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400"];
  const Icon = type === "assistant" ? Bot : User;

  const variants = useMemo(
    () => createAnimationVariants(callStarted && isActive),
    [callStarted, isActive],
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {[54, 48, 40, 32].map((size, index) => (
        <motion.div
          key={size}
          {...variants}
          transition={{
            ...variants.transition,
            delay: 0.4 + index * 0.2,
          }}
          className={cn(
            `flex items-center justify-center rounded-full`,
            `h-${size} w-${size}`, // Tailwind classes for size
            colors[index],
            index === 0 ? "" : "absolute",
          )}
        >
          {index === 3 && (
            <Icon className="h-16 w-16 text-white" strokeWidth={1.25} />
          )}
        </motion.div>
      ))}
    </div>
  );
});
AnimatedAvatar.displayName = "AnimatedAvatar";

const InterviewPage: React.FC = (): ReactElement => {
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Initializing...");
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean>(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading for config and assistant
  const [, setTimer] = useState(0); // Timer state, value not directly used here
  const [interviewConfig, setInterviewConfig] =
    useState<PracticeInterview | null>(null); // Store single config

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const vapiRef = useRef<Vapi | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Fetch interview configuration based on ID
  const fetchInterviewConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/mock-interview/get"); // Assuming this endpoint returns all configs
      if (response.status !== 200) {
        toast.error("Failed to load interview details", {
          description: response.data.message,
        });
        router.replace("/mock-interviews"); // Redirect if config fails
        return;
      }
      const allConfigs: PracticeInterview[] = response.data.data;
      const selectedConfig = allConfigs.find(
        (item: PracticeInterview) => item.id === id,
      );

      if (!selectedConfig) {
        toast.error("Interview not found", {
          description:
            "The requested interview configuration could not be found.",
        });
        router.replace("/mock-interviews"); // Redirect if ID not found
        return;
      }
      setInterviewConfig(selectedConfig);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch interview configuration");
      router.replace("/mock-interviews"); // Redirect on error
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // Get Assistant ID from backend
  const getAssistantId = useCallback(async () => {
    if (!interviewConfig) return; // Ensure config is loaded
    setLoading(true);
    try {
      const response = await axios.post("/api/assistant", interviewConfig, {
        headers: { "Content-Type": "application/json" },
      });
      setAssistantId(response.data.data.assistantId);
      setConnectionStatus("Assistant initialized. Ready to connect.");
    } catch (error) {
      console.error("Failed to get assistant ID:", error);
      setConnectionStatus("Failed to initialize assistant");
      toast.error("Failed to initialize assistant");
    } finally {
      setLoading(false);
    }
  }, [interviewConfig]);

  // Request microphone permission
  const requestMicrophonePermission =
    useCallback(async (): Promise<boolean> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMicrophoneAccess(true);
        setConnectionStatus("Microphone access granted.");
        stream.getTracks().forEach((track) => track.stop()); // Stop stream after getting permission
        return true;
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setMicrophoneAccess(false);
        setConnectionStatus(
          "Microphone permission denied. Please allow microphone access.",
        );
        toast.error(
          "Microphone access denied. Please enable it in your browser settings.",
        );
        return false;
      }
    }, []);

  // Handle time up - auto end call
  const handleTimeUp = useCallback(async () => {
    console.info("Time limit reached - auto-ending call...");
    setConnectionStatus("Time up - Call ended");
    if (vapiRef.current && callStarted) {
      try {
        await vapiRef.current.stop();
      } catch (error) {
        console.error("Error stopping call:", error);
      }
    }
    toast.info("Time's up - Call ended", {
      description: "Redirecting to report in 3 seconds...",
    });
    setTimeout(() => {
      router.replace(`/report/${id}`); // Redirect to report page
    }, 3000);
  }, [callStarted, router, id]);

  // Handler for Vapi 'message' events (transcripts, speech start/end)
  const handleVapiMessage = useCallback(
    (message: {
      type?: any;
      role: any;
      transcriptType?: any;
      transcript?: any;
    }) => {
      switch (message.type) {
        case "transcript": {
          const { role, transcriptType, transcript } = message;
          if (transcriptType === "partial") {
            setCurrentRole(role);
            setCurrentTranscript(transcript);
          } else if (transcriptType === "final") {
            setMessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === role && msg.transcript === transcript,
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
          setCurrentRole(message.role || "user");
          setConnectionStatus("Listening...");
          break;
        case "speech-end":
          setCurrentRole(null);
          break;
        default:
          // console.log("Unhandled Vapi message type:", message.type, message);
          break;
      }
    },
    [],
  );

  // Handler for Vapi 'call-start' event
  const handleVapiCallStart = useCallback(() => {
    setCallStarted(true);
    setConnectionStatus("Call active - You can speak now");
  }, []);

  // Handler for Vapi 'call-end' event
  const handleVapiCallEnd = useCallback(() => {
    setCallStarted(false);
    setCurrentRole(null);
    setCurrentTranscript("");
    setConnectionStatus("Call ended");
  }, []);

  // Handler for Vapi 'error' event
  const handleVapiError = useCallback((error: Error) => {
    console.error("Vapi error:", error);
    setConnectionStatus(`Error: ${error.message || "Connection failed"}`);
    toast.error("Call error", {
      description: error.message || "An error occurred during the call.",
    });
  }, []);

  // End call function
  const endCall = useCallback(async () => {
    if (vapiRef.current && callStarted) {
      try {
        await vapiRef.current.stop();
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
    toast.info("Call ended", {
      description: "Redirecting to dashboard...",
    });
    setCallStarted(false);
    setCurrentRole(null);
    setCurrentTranscript("");
    setTimeout(() => {
      router.replace("/dashboard"); // Redirect to dashboard or report page
    }, 1000);
  }, [callStarted, router]);

  // --- Effects ---

  // 1. Fetch interview config on component mount
  useEffect(() => {
    fetchInterviewConfig();
  }, [fetchInterviewConfig]);

  // 2. Get assistant ID once config is loaded
  useEffect(() => {
    if (interviewConfig && !assistantId && !loading) {
      getAssistantId();
    }
  }, [interviewConfig, assistantId, loading, getAssistantId]);

  // 3. Initialize Vapi and start call once assistantId is available
  useEffect(() => {
    if (!assistantId || loading) return;

    const initializeVapiAndCall = async () => {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      if (!vapiRef.current) {
        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_AI_API_KEY!);
      }
      const vapi = vapiRef.current;

      // Clean up existing handlers before registering new ones
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Register new handlers
      vapi.on("message", handleVapiMessage);
      vapi.on("call-start", handleVapiCallStart);
      vapi.on("call-end", handleVapiCallEnd);
      vapi.on("error", handleVapiError);

      // Store cleanup function
      cleanupRef.current = () => {
        vapi.off("message", handleVapiMessage);
        vapi.off("call-start", handleVapiCallStart);
        vapi.off("call-end", handleVapiCallEnd);
        vapi.off("error", handleVapiError);
      };

      try {
        setConnectionStatus("Starting call...");
        await vapi.start(assistantId);
      } catch (error) {
        if (error instanceof Error) {
          setConnectionStatus(
            `Failed to start call: ${error.message || "Unknown error"}`,
          );
        }
      }
    };

    initializeVapiAndCall();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [
    assistantId,
    loading,
    requestMicrophonePermission,
    handleVapiMessage,
    handleVapiCallStart,
    handleVapiCallEnd,
    handleVapiError,
  ]);

  // Memoized status indicator colors
  const statusColorClass = useMemo(() => {
    if (!microphoneAccess) return "text-red-600";
    return callStarted ? "text-green-600" : "text-orange-600";
  }, [microphoneAccess, callStarted]);

  const statusCircleColorClass = useMemo(() => {
    if (!microphoneAccess) return "text-red-600";
    return callStarted ? "text-green-600" : "text-orange-600";
  }, [microphoneAccess, callStarted]);

  if (loading || !interviewConfig) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="border-primary/20 h-12 w-12 rounded-full border-4"></div>
            <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Preparing your interview...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we set up the session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <main className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
        {/* Interview Header */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="bg-background flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm">
            <Circle
              className={cn("h-3 w-3", statusCircleColorClass)}
              fill={statusCircleColorClass}
            />
            <p className={cn("text-sm font-medium", statusColorClass)}>
              {connectionStatus}
            </p>
          </div>

          <div className="bg-background flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm">
            <TimerIcon className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              Time Remaining:
            </span>
            <Timer
              callStarted={callStarted}
              setTimer={setTimer}
              onTimeUp={handleTimeUp}
              maxTime={interviewConfig.estimated_time}
            />
          </div>

          <div className="bg-background flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm">
            <Mic className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              Microphone:
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                microphoneAccess ? "text-green-600" : "text-red-600",
              )}
            >
              {microphoneAccess ? "Active" : "Denied"}
            </span>
          </div>
        </div>

        {/* Main Interview Area */}
        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          {/* Avatars Section */}
          <Card className="flex h-full flex-col items-center justify-center p-6 lg:w-1/3">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-primary text-2xl font-bold">
                Interview Session
              </CardTitle>
              <CardDescription>{`${interviewConfig.topic} - ${interviewConfig.difficulty}`}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-8">
              <div className="flex h-40 w-40 items-center justify-center">
                <AnimatedAvatar
                  type="assistant"
                  isActive={currentRole === "assistant"}
                  callStarted={callStarted}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Nora (AI Assistant)</p>
                <p className="text-muted-foreground text-sm">Speaking...</p>
              </div>
              <div className="flex h-40 w-40 items-center justify-center">
                <AnimatedAvatar
                  type="user"
                  isActive={currentRole === "user"}
                  callStarted={callStarted}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">You</p>
                <p className="text-muted-foreground text-sm">Speaking...</p>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <Card className="flex flex-1 flex-col lg:w-2/3">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl">Transcript</CardTitle>
              <CardDescription>
                Real-time transcription of your interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              <Transcript
                transcripts={messages}
                liveTranscription={currentTranscript}
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-center">
          <Button
            onClick={endCall}
            size="lg"
            variant="destructive"
            disabled={!callStarted}
            className="shadow-lg"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <PhoneIcon className="h-5 w-5 rotate-[135deg]" />
              </TooltipTrigger>
              <TooltipContent>End Call</TooltipContent>
            </Tooltip>
            <span className="ml-2">End Call</span>
          </Button>
        </div>
      </main>
    </TooltipProvider>
  );
};

export default InterviewPage;
