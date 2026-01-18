"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Pause,
  Play,
  MessageSquare
} from "lucide-react";

import type { MockInterviews, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [speakingStatus, setSpeakingStatus] = useState<"idle" | "ai-speaking" | "user-speaking">("idle");
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
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timer effect
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
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const fetchInterviewConfig = useCallback(async () => {
    if (!id) {
      toast.error("No interview ID provided");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/mock-interview/get/id?id=${id}`);
      if (res.status === 200 && res.data?.data) {
        setInterviewConfig(res.data.data);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err) {
      console.error("Failed to fetch interview config:", err);
      toast.error("Failed to load interview configuration");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getAssistantId = useCallback(async () => {
    if (!interviewConfig || !session?.user?.name) {
      return;
    }

    try {
      setConnectionStatus("connecting");
      const res = await axios.post(`/api/assistant/`, {
        ...interviewConfig,
        candidateName: session.user.name,
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.data?.message || "Failed to get assistant ID");
      }

      if (!res.data?.data?.id) {
        throw new Error("Invalid assistant response - missing ID");
      }

      if (!isUnmountedRef.current) {
        setAssistantId(res.data.data.id);
      }
    } catch (err) {
      console.error("Assistant creation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize assistant";
      toast.error(errorMessage);
      if (!isUnmountedRef.current) {
        setConnectionStatus("error");
      }
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
        console.error("Failed to create history:", error);
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
      console.error("Failed to update history:", error);
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
      console.error("Failed to generate report:", err);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  }, [id, messages, interviewConfig, router, isGeneratingReport, sessionStartTime]);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      stream.getTracks().forEach((track) => track.stop());

      if (!isUnmountedRef.current) {
        setMicrophoneAccess(true);
      }
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      if (!isUnmountedRef.current) {
        setMicrophoneAccess(false);
      }
      toast.error("Microphone access is required for the interview");
      return false;
    }
  }, []);

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
        if (!isUnmountedRef.current) {
          setSpeakingStatus("ai-speaking");
        }
      });

      vapi.on("speech-end", () => {
        if (!isUnmountedRef.current) {
          setSpeakingStatus("idle");
        }
      });

      vapi.on("message", (message: Message) => {
        if (isUnmountedRef.current) return;

        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;

          if (role === "user") {
            setSpeakingStatus("user-speaking");
          }

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
            if (role === "user") {
              setSpeakingStatus("idle");
            }
          }
        }
      });

      vapi.on("error", (error: Error) => {
        console.error("Vapi error:", error);
        if (!isUnmountedRef.current) {
          setConnectionStatus("error");
        }
        toast.error(`Call error: ${error.message}`);
      });

      await vapi.start(assistantId);
    } catch (error) {
      console.error("Call start error:", error);
      setConnectionStatus("error");
      toast.error("Failed to start call");
    }
  }, [assistantId, microphoneAccess, callStarted, createHistory, interviewConfig]);

  const endCall = useCallback(async () => {
    if (!callStarted) return;

    try {
      if (vapiRef.current) {
        await vapiRef.current.stop();
      }
    } catch (err) {
      console.error("Error stopping call:", err);
    } finally {
      if (!isUnmountedRef.current) {
        setCallStarted(false);
        setConnectionStatus("disconnected");
        setSpeakingStatus("idle");

        if (!sessionStartTime || !interviewConfig) return;

        const actualDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60;
        
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

  // Effects
  useEffect(() => {
    if (id) fetchInterviewConfig();
  }, [id, fetchInterviewConfig]);

  useEffect(() => {
    if (interviewConfig && session?.user?.name && !assistantId) {
      getAssistantId();
    }
  }, [interviewConfig, session, assistantId, getAssistantId]);

  useEffect(() => {
    if (assistantId && !callStarted && !microphoneAccess) {
      requestMicrophonePermission();
    }
  }, [assistantId, callStarted, microphoneAccess, requestMicrophonePermission]);

  useEffect(() => {
    if (assistantId && microphoneAccess && !callStarted && !loading) {
      const timer = setTimeout(() => startCall(), 1000);
      return () => clearTimeout(timer);
    }
  }, [assistantId, microphoneAccess, callStarted, loading, startCall]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
          vapiRef.current.removeAllListeners();
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      }
    };
  }, []);

  // Loading state
  if (loading && !interviewConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // No ID state
  if (!id) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">No Interview ID</h1>
            <p className="mt-2 text-gray-600">Please provide a valid interview ID</p>
            <Button className="mt-4" onClick={() => router.push("/mock-interviews")}>
              Go to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generating report state
  if (isGeneratingReport) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Analyzing your interview...</h2>
          <p className="mt-2 text-gray-600">Please wait while we generate your feedback report</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header Bar */}
      <header className="border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">{ interviewConfig?.topic || "Loading..." }</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-medium">
                {interviewConfig?.topic || "Loading..."}
              </Badge>
              {interviewConfig?.difficulty && (
                <Badge className={getDifficultyColor(interviewConfig.difficulty)}>
                  {interviewConfig.difficulty}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="font-mono text-lg font-semibold text-gray-900">
                {formatTime(elapsedTime)}
              </span>
              {interviewConfig?.estimated_time && (
                <span className="text-sm text-gray-500">
                  / {interviewConfig.estimated_time}:00
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-6">
          {/* AI Interviewer Panel */}
          <div className="flex w-80 flex-col">
            <Card className="flex-1">
              <CardContent className="flex h-full flex-col items-center justify-center p-6">
                {/* AI Avatar */}
                <div className={cn(
                  "relative rounded-full p-1",
                  speakingStatus === "ai-speaking" && "ring-4 ring-primary ring-offset-2 animate-pulse"
                )}>
                  <Avatar className="h-32 w-32 bg-primary">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      <Bot size={64} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <h3 className="mt-4 text-lg font-semibold text-gray-900">AI Interviewer</h3>
                
                {/* Speaking Indicator */}
                <div className={cn(
                  "mt-3 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                  speakingStatus === "ai-speaking" && "bg-primary/10 text-primary",
                  speakingStatus === "user-speaking" && "bg-green-100 text-green-700",
                  speakingStatus === "idle" && "bg-gray-100 text-gray-600"
                )}>
                  {speakingStatus === "ai-speaking" && (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      AI is speaking...
                    </>
                  )}
                  {speakingStatus === "user-speaking" && (
                    <>
                      <Mic className="h-4 w-4 animate-pulse" />
                      Listening to you...
                    </>
                  )}
                  {speakingStatus === "idle" && callStarted && (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Ready to listen
                    </>
                  )}
                  {!callStarted && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {connectionStatus === "connecting" ? "Connecting..." : "Waiting to start"}
                    </>
                  )}
                </div>

                {/* User Panel */}
                <Separator className="my-6 w-full" />
                
                <div className={cn(
                  "relative rounded-full p-1",
                  speakingStatus === "user-speaking" && "ring-4 ring-green-500 ring-offset-2 animate-pulse"
                )}>
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {session?.user?.name?.charAt(0).toUpperCase() || <User size={32} />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {session?.user?.name || "You"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Live Transcript Panel */}
          <div className="flex flex-1 flex-col">
            <Card className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b bg-gray-50 px-4 py-3">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <MessageSquare className="h-5 w-5" />
                  Live Transcript
                </h2>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && !currentTranscript && (
                    <div className="flex h-48 items-center justify-center text-center text-gray-500">
                      <div>
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2">Transcript will appear here once the interview starts</p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {msg.role === "assistant" ? (
                          <AvatarFallback className="bg-primary text-white">
                            <Bot size={16} />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gray-200">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          msg.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.transcript}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current partial transcript */}
                  {currentTranscript && currentRole && (
                    <div
                      className={cn(
                        "flex gap-3 opacity-70",
                        currentRole === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {currentRole === "assistant" ? (
                          <AvatarFallback className="bg-primary text-white">
                            <Bot size={16} />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gray-200">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          currentRole === "user"
                            ? "bg-primary/70 text-white"
                            : "bg-gray-100/70 text-gray-700"
                        )}
                      >
                        <p className="text-sm leading-relaxed italic">{currentTranscript}...</p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>

      {/* Control & Status Bar */}
      <footer className="border-t bg-white px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
              microphoneAccess && !isMuted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {microphoneAccess && !isMuted ? (
                <><Mic className="h-4 w-4" /> Mic: ON</>
              ) : (
                <><MicOff className="h-4 w-4" /> Mic: {isMuted ? "Muted" : "OFF"}</>
              )}
            </div>
            
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
              <Volume2 className="h-4 w-4" /> Speaker: ON
            </div>
            
            <div className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
              connectionStatus === "connected" ? "bg-green-100 text-green-700" :
              connectionStatus === "connecting" ? "bg-yellow-100 text-yellow-700" :
              connectionStatus === "error" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            )}>
              {connectionStatus === "connected" ? (
                <><Wifi className="h-4 w-4" /> Connected</>
              ) : connectionStatus === "connecting" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connecting</>
              ) : connectionStatus === "error" ? (
                <><WifiOff className="h-4 w-4" /> Error</>
              ) : (
                <><WifiOff className="h-4 w-4" /> Disconnected</>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!callStarted && assistantId && microphoneAccess && (
              <Button
                onClick={startCall}
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={loading}
              >
                <Phone className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            )}
            
            {callStarted && (
              <>
                <Button
                  variant="outline"
                  onClick={toggleMute}
                  className={cn(
                    isMuted && "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  )}
                >
                  {isMuted ? (
                    <><MicOff className="mr-2 h-4 w-4" /> Unmute</>
                  ) : (
                    <><Mic className="mr-2 h-4 w-4" /> Mute Mic</>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={endCall}
                  disabled={isGeneratingReport}
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Interview
                </Button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionPage;
