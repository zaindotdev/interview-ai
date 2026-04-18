"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Clock,
  Loader2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  User,
  Wifi,
  WifiOff,
  Volume2,
  MessageSquare,
} from "lucide-react";

import type { MockInterviews, Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

const SessionPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [interviewConfig, setInterviewConfig] = useState<MockInterviews | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [speakingStatus, setSpeakingStatus] = useState<
    "idle" | "ai-speaking" | "user-speaking"
  >("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const isUnmountedRef = useRef(false);
  const isCreatingAssistantRef = useRef(false); // prevents double creation
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStarted && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted, sessionStartTime]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ─── Mic: request immediately on mount, don't wait for assistantId ───
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      stream.getTracks().forEach((track) => track.stop());
      if (!isUnmountedRef.current) setMicrophoneAccess(true);
      return true;
    } catch (error) {
      console.error("[mic] Permission error:", error);
      if (!isUnmountedRef.current) setMicrophoneAccess(false);
      toast.error("Microphone access is required for the interview");
      return false;
    }
  }, []);

  const fetchInterviewConfig = useCallback(async () => {
    if (!id) { toast.error("No interview ID provided"); return; }
    setLoading(true);
    try {
      const res = await axios.get(`/api/mock-interview/get/id?id=${id}`);
      if (res.status === 200 && res.data?.data) {
        setInterviewConfig(res.data.data);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err) {
      console.error("[session] Failed to fetch interview config:", err);
      toast.error("Failed to load interview configuration");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getAssistantId = useCallback(async () => {
    if (!interviewConfig || !session?.user?.name) return;
    if (isCreatingAssistantRef.current) return; // guard against double-fire
    isCreatingAssistantRef.current = true;

    try {
      setConnectionStatus("connecting");
      const res = await axios.post(`/api/assistant/`, {
        ...interviewConfig,
        candidateName: session.user.name,
      });

      if (!res.data?.data?.id) throw new Error("Invalid assistant response - missing ID");

      if (!isUnmountedRef.current) setAssistantId(res.data.data.id);
    } catch (err) {
      console.error("[session] Assistant creation failed:", err);
      isCreatingAssistantRef.current = false; // allow retry on error
      toast.error(err instanceof Error ? err.message : "Failed to initialize assistant");
      if (!isUnmountedRef.current) setConnectionStatus("error");
    }
  }, [interviewConfig, session]);

  const createHistory = useCallback(
    async (status: string = "ongoing") => {
      if (!id || historyId) return;
      try {
        const startTime = sessionStartTime || new Date();
        const res = await axios.post(`/api/mock-interview/history`, {
          interviewId: id,
          status,
          startTime: startTime.toISOString(),
        });
        if (res.status === 201 && res.data?.data?.history?.id) {
          setHistoryId(res.data.data.history.id);
          return res.data.data.history.id;
        }
      } catch (error) {
        console.error("[session] Failed to create history:", error);
      }
    },
    [id, historyId, sessionStartTime],
  );

  const updateHistory = useCallback(async () => {
    if (!id || !sessionStartTime) return;
    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
      await axios.post(`/api/mock-interview/history`, {
        interviewId: id,
        status: "completed",
        startTime: sessionStartTime.toISOString(),
        duration,
      });
    } catch (error) {
      console.error("[session] Failed to update history:", error);
    }
  }, [id, sessionStartTime]);

  const generateReport = useCallback(async () => {
    if (!id || isGeneratingReport) return;
    setIsGeneratingReport(true);
    const actualDuration = sessionStartTime
      ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)
      : interviewConfig?.estimated_time || 0;

    try {
      const res = await axios.post(`/api/mock-interview/report`, {
        transcripts: messages,
        conversationId: id,
        focusedSkills: interviewConfig?.focus || [],
        duration: actualDuration,
        topic: interviewConfig?.topic,
      });
      if (res.status === 200 && res.data?.data?.reportId) {
        router.replace(`/report/?reportId=${res.data.data.reportId}`);
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (err) {
      console.error("[session] Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  }, [id, messages, interviewConfig, router, isGeneratingReport, sessionStartTime]);

  const startCall = useCallback(async () => {
    if (!assistantId || !microphoneAccess || callStarted) return;

    try {
      setConnectionStatus("connecting");
      const startTime = new Date();
      setSessionStartTime(startTime);

      if (!vapiRef.current) {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_AI_API_KEY;
        if (!apiKey) throw new Error("VAPI API key not configured");
        vapiRef.current = new Vapi(apiKey);
      }

      const vapi = vapiRef.current;
      vapi.removeAllListeners();

      vapi.on("call-start", async () => {
        if (!isUnmountedRef.current) {
          setCallStarted(true);
          setConnectionStatus("connected");
          await createHistory("ongoing");

          if (interviewConfig?.estimated_time) {
            const timeoutDuration = interviewConfig.estimated_time * 60 * 1000;
            setTimeout(() => {
              if (!isUnmountedRef.current && vapiRef.current) {
                toast.info("Interview time reached — ending session...");
                vapiRef.current.stop();
                endCall();
              }
            }, timeoutDuration);
          }
        }
      });

      vapi.on("call-end", () => {
        if (!isUnmountedRef.current) {
          setCallStarted(false);
          setCurrentRole(null);
          setCurrentTranscript("");
          setConnectionStatus("disconnected");
          setSpeakingStatus("idle");
        }
      });

      vapi.on("speech-start", () => {
        if (!isUnmountedRef.current) setSpeakingStatus("ai-speaking");
      });

      vapi.on("speech-end", () => {
        if (!isUnmountedRef.current) setSpeakingStatus("idle");
      });

      vapi.on("message", (message: Message) => {
        if (isUnmountedRef.current) return;
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          console.log(message);
          if (role === "user") setSpeakingStatus("user-speaking");

          if (transcriptType === "partial") {
            setCurrentTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            setMessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === role && msg.transcript === transcript,
              );
              if (isDuplicate) return prev;
              return [...prev, { role, transcript }];
            });
            setCurrentTranscript("");
            setCurrentRole(null);
            if (role === "user") setSpeakingStatus("idle");
          }
        }
      });

      vapi.on("error", (error: Error) => {
        console.error("[vapi] Error:", error);
        if (!isUnmountedRef.current) setConnectionStatus("error");
        toast.error(`Call error: ${error.message}`);
      });

      await vapi.start(assistantId);
    } catch (error) {
      console.error("[session] Call start error:", error);
      setConnectionStatus("error");
      toast.error("Failed to start call");
    }
  }, [assistantId, microphoneAccess, callStarted, createHistory, interviewConfig]);

  const endCall = useCallback(async () => {
    if (!callStarted) return;
    try {
      if (vapiRef.current) await vapiRef.current.stop();
    } catch (err) {
      console.error("[session] Error stopping call:", err);
    } finally {
      if (!isUnmountedRef.current) {
        setCallStarted(false);
        setConnectionStatus("disconnected");
        setSpeakingStatus("idle");

        if (!sessionStartTime || !interviewConfig) return;

        const actualDuration =
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60;

        if (actualDuration < interviewConfig.estimated_time) {
          toast.info("Interview ended early — redirecting...");
          await updateHistory();
          setTimeout(() => router.replace("/mock-interviews"), 1200);
          return;
        }

        toast.info("Interview completed — generating report...");
        setIsGeneratingReport(true);
        await updateHistory();
        await generateReport();
      }
    }
  }, [callStarted, sessionStartTime, interviewConfig, updateHistory, generateReport, router]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      setIsMuted((prev) => {
        const newMuted = !prev;
        vapiRef.current?.setMuted(newMuted);
        return newMuted;
      });
    }
  }, []);

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Kick off mic + config fetch in parallel on mount
  useEffect(() => {
    if (!id) return;
    requestMicrophonePermission();
    fetchInterviewConfig();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once config is ready, create the assistant (guarded by ref)
  useEffect(() => {
    if (interviewConfig && session?.user?.name && !assistantId) {
      getAssistantId();
    }
  }, [interviewConfig, session, assistantId, getAssistantId]);

  // Auto-start call once both assistantId and mic are ready
  useEffect(() => {
    if (assistantId && microphoneAccess && !callStarted && !loading) {
      const timer = setTimeout(() => startCall(), 500);
      return () => clearTimeout(timer);
    }
  }, [assistantId, microphoneAccess, callStarted, loading, startCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
          vapiRef.current.removeAllListeners();
        } catch (err) {
          console.error("[session] Cleanup error:", err);
        }
      }
    };
  }, []);
  if (loading && !interviewConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }
 
  if (!id) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-destructive">No Interview ID</h1>
            <p className="mt-2 text-muted-foreground">Please provide a valid interview ID</p>
            <Button className="mt-4" onClick={() => router.push("/mock-interviews")}>
              Go to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
 
  if (isGeneratingReport) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
          <h2 className="mt-6 text-2xl font-bold">Analyzing your interview...</h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we generate your feedback report
          </p>
        </div>
      </div>
    );
  }
 
  const isAiSpeaking = speakingStatus === "ai-speaking";
  const isUserSpeaking = speakingStatus === "user-speaking";
 
  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5">
      <style>{`
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes ring-pulse-2 {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.32); opacity: 0; }
        }
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .speaking-ring-1 {
          animation: ring-pulse 1.2s ease-out infinite;
        }
        .speaking-ring-2 {
          animation: ring-pulse-2 1.2s ease-out infinite 0.2s;
        }
        .wave-bar {
          animation: wave-bar 0.6s ease-in-out infinite;
        }
        .wave-bar:nth-child(1) { animation-delay: 0s; }
        .wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { animation-delay: 0.1s; }
        .wave-bar:nth-child(5) { animation-delay: 0s; }
      `}</style>
 
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-primary truncate text-xl font-bold md:text-2xl">
            {interviewConfig?.topic}
          </h1>
          <p className="text-muted-foreground mt-0.5 hidden max-w-xl truncate text-sm md:block">
            {interviewConfig?.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              className={cn("uppercase text-xs", getDifficultyColor(interviewConfig?.difficulty || ""))}
            >
              {interviewConfig?.difficulty || "Unknown"}
            </Badge>
            {interviewConfig?.focus?.length ? (
              <Badge variant="outline" className="text-xs">
                {interviewConfig.focus.join(", ")}
              </Badge>
            ) : null}
          </div>
        </div>
 
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(elapsedTime)}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 px-3 py-1.5 text-sm",
              connectionStatus === "connected" && "border-green-200 bg-green-50 text-green-700",
              connectionStatus === "connecting" && "border-yellow-200 bg-yellow-50 text-yellow-700",
              connectionStatus === "error" && "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {connectionStatus === "connected" ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : connectionStatus === "connecting" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : connectionStatus === "error" ? (
              <WifiOff className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="capitalize">{connectionStatus}</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            disabled={!callStarted}
            className="gap-1.5"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Button
            size="sm"
            onClick={callStarted ? endCall : startCall}
            className={cn(
              "gap-1.5 font-semibold",
              callStarted
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {callStarted ? (
              <>
                <PhoneOff className="h-4 w-4" />
                <span className="hidden sm:inline">End Call</span>
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Start Call</span>
              </>
            )}
          </Button>
        </div>
      </div>
 
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex shrink-0 flex-row gap-3 lg:w-72 lg:flex-col xl:w-80">
          <div
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center rounded-xl border bg-card p-4 transition-all duration-300",
              isAiSpeaking ? "border-primary/40 shadow-md" : "border-border",
            )}
          >
            <div className="relative mb-3 flex items-center justify-center">
              {isAiSpeaking && (
                <>
                  <span
                    className="speaking-ring-1 absolute inset-0 rounded-full"
                    style={{ background: "var(--primary)", opacity: 0.15 }}
                  />
                  <span
                    className="speaking-ring-2 absolute inset-0 rounded-full"
                    style={{ background: "var(--primary)", opacity: 0.08 }}
                  />
                </>
              )}
              <div
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 md:h-20 md:w-20",
                  isAiSpeaking
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary",
                )}
              >
                <Bot
                  className={cn(
                    "h-7 w-7 md:h-9 md:w-9 transition-colors duration-300",
                    isAiSpeaking ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </div>
            </div>
 
            <p className="text-sm font-semibold text-foreground">AI Interviewer</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {isAiSpeaking ? "Speaking..." : "Listening"}
            </p>
 
            {isAiSpeaking && (
              <div className="mt-3 flex items-end gap-0.5" style={{ height: "20px" }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="wave-bar inline-block w-1 rounded-full"
                    style={{
                      height: "100%",
                      background: "var(--primary)",
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            )}
            {!isAiSpeaking && (
              <div className="mt-3 flex items-end gap-0.5" style={{ height: "20px" }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="inline-block w-1 rounded-full"
                    style={{
                      height: "30%",
                      background: "var(--muted-foreground)",
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
 
          <div
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center rounded-xl border bg-card p-4 transition-all duration-300",
              isUserSpeaking ? "border-blue-400/40 shadow-md" : "border-border",
            )}
          >
            <div className="relative mb-3 flex items-center justify-center">
              {isUserSpeaking && (
                <>
                  <span
                    className="speaking-ring-1 absolute inset-0 rounded-full"
                    style={{ background: "#3b82f6", opacity: 0.15 }}
                  />
                  <span
                    className="speaking-ring-2 absolute inset-0 rounded-full"
                    style={{ background: "#3b82f6", opacity: 0.08 }}
                  />
                </>
              )}
              <div
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 md:h-20 md:w-20",
                  isUserSpeaking ? "border-blue-400 bg-blue-50" : "border-border bg-secondary",
                )}
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "You"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    className={cn(
                      "h-7 w-7 md:h-9 md:w-9 transition-colors duration-300",
                      isUserSpeaking ? "text-blue-500" : "text-muted-foreground",
                    )}
                  />
                )}
              </div>
            </div>
 
            <p className="text-sm font-semibold text-foreground">
              {session?.user?.name?.split(" ")[0] ?? "You"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {isUserSpeaking
                ? "Speaking..."
                : isMuted
                  ? "Muted"
                  : callStarted
                    ? "Listening"
                    : "Not in call"}
            </p>
 
            {isUserSpeaking && (
              <div className="mt-3 flex items-end gap-0.5" style={{ height: "20px" }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="wave-bar inline-block w-1 rounded-full"
                    style={{
                      height: "100%",
                      background: "#3b82f6",
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            )}
            {!isUserSpeaking && (
              <div className="mt-3 flex items-end gap-0.5" style={{ height: "20px" }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="inline-block w-1 rounded-full"
                    style={{
                      height: "30%",
                      background: "var(--muted-foreground)",
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
 
        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <MessageSquare className="text-primary h-4 w-4 shrink-0" />
            <h2 className="text-sm font-semibold">Conversation</h2>
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {messages.length} messages
              </Badge>
            )}
          </div>
 
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !currentTranscript ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="rounded-full bg-secondary p-4">
                  <MessageSquare className="text-muted-foreground h-6 w-6" />
                </div>
                <p className="text-muted-foreground max-w-xs text-center text-sm">
                  Start the interview to see the conversation transcript here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-end gap-2.5",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        msg.role === "user"
                          ? "border-blue-200 bg-blue-50"
                          : "border-primary/20 bg-primary/10",
                      )}
                    >
                      {msg.role === "user" ? (
                        session?.user?.image ? (
                          <img
                            src={session.user.image}
                            alt="You"
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-3.5 w-3.5 text-blue-500" />
                        )
                      ) : (
                        <Bot className="text-primary h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "rounded-br-sm bg-blue-500 text-white"
                          : "rounded-bl-sm border border-border bg-secondary text-secondary-foreground",
                      )}
                    >
                      {msg.transcript}
                    </div>
                  </div>
                ))}
 
                {currentTranscript && (
                  <div className="flex flex-row-reverse items-end gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="You"
                          fill
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-400/70 px-3.5 py-2.5 text-sm leading-relaxed text-white italic">
                      {currentTranscript}
                    </div>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
 
export default SessionPage;