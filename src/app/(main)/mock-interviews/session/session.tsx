"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, Circle, Loader2, Mic, Phone, User } from "lucide-react";
import SessionCard from "@/components/session/card";
import Transcript from "@/components/session/transcript";

import type { MockInterviews, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

const SessionPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [interviewConfig, setInterviewConfig] = useState<MockInterviews | null>(
    null,
  );
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Waiting...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const isUnmountedRef = useRef(false);

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
      setConnectionStatus("Creating assistant...");
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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize assistant";
      toast.error(errorMessage);
      if (!isUnmountedRef.current) {
        setConnectionStatus("Assistant initialization failed");
      }
    }
  }, [interviewConfig, session]);

  const createHistory = useCallback(
    async (status: string = "ongoing") => {
      if (!id || historyId) {
        return;
      }

      try {
        const startTime = sessionStartTime || new Date();

        const res = await axios.post(`/api/mock-interview/history`, {
          interviewId: id,
          status,
          startTime: startTime.toISOString(),
        });

        if (res.status === 201 && res.data?.data?.history?.id) {
          setHistoryId(res.data.data.history.id);
          console.info(
            "History created successfully:",
            res.data.data.history.id,
          );
          return res.data.data.history.id;
        } else {
          throw new Error(res?.data?.message || "Failed to create history");
        }
      } catch (error) {
        console.error("Failed to create history:", error);
        toast.error("Failed to track interview session");
      }
    },
    [id, historyId, sessionStartTime],
  );

  const updateHistory = useCallback(async () => {
    if (!id || !sessionStartTime) {
      return;
    }

    try {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - sessionStartTime.getTime()) / 1000,
      );

      const res = await axios.post(`/api/mock-interview/history`, {
        interviewId: id,
        status: "completed",
        startTime: sessionStartTime.toISOString(),
        duration,
      });

      if (res.status === 201) {
        console.info("History updated successfully");
      } else {
        throw new Error(res?.data?.message || "Failed to update history");
      }
    } catch (error) {
      console.error("Failed to update history:", error);
    }
  }, [id, sessionStartTime]);

  const generateReport = useCallback(async () => {
    if (!id || isGeneratingReport) {
      return;
    }

    setIsGeneratingReport(true);

    const actualDuration = sessionStartTime
      ? Math.floor(
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60,
        )
      : interviewConfig?.estimated_time || 0;

    const reportPayload = {
      transcripts: messages,
      conversationId: id,
      focusedSkills: interviewConfig?.focus || [],
      duration: actualDuration,
      topic: interviewConfig?.topic,
    };

    try {
      const res = await axios.post(`/api/mock-interview/report`, reportPayload);

      if (res.status !== 200) {
        throw new Error(res?.data?.message || "Failed to generate report");
      }

      if (res.data?.data?.reportId) {
        router.replace(`/report/?reportId=${res.data.data.reportId}`);
      } else {
        throw new Error("Invalid report response - missing reportId");
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate report";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    id,
    messages,
    interviewConfig,
    router,
    isGeneratingReport,
    sessionStartTime,
  ]);

  const requestMicrophonePermission =
    useCallback(async (): Promise<boolean> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        });

        stream.getTracks().forEach((track) => track.stop());

        if (!isUnmountedRef.current) {
          setMicrophoneAccess(true);
          setConnectionStatus("Microphone access granted");
        }
        return true;
      } catch (error) {
        console.error("Microphone permission error:", error);
        if (!isUnmountedRef.current) {
          setMicrophoneAccess(false);
          setConnectionStatus(
            "Microphone permission denied. Please allow mic access and refresh.",
          );
        }
        toast.error("Microphone access is required for the interview");
        return false;
      }
    }, []);

  const startCall = useCallback(async () => {
    if (!assistantId) {
      console.error("No assistant ID available");
      toast.error("Assistant not ready");
      return;
    }

    if (!microphoneAccess) {
      console.error("No microphone access");
      toast.error("Microphone access required");
      return;
    }

    if (callStarted) {
      console.warn("Call already started");
      return;
    }

    try {
      setConnectionStatus("Starting call...");

      const startTime = new Date();
      setSessionStartTime(startTime);

      if (!vapiRef.current) {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_AI_API_KEY;
        if (!apiKey) {
          throw new Error("VAPI API key not configured");
        }
        vapiRef.current = new Vapi(apiKey);
      }

      const vapi = vapiRef.current;

      vapi.removeAllListeners();

      vapi.on("call-start", async () => {
        if (!isUnmountedRef.current) {
          setCallStarted(true);
          setConnectionStatus("Call active - You can speak now");

          await createHistory("ongoing");
        }
      });

      vapi.on("call-end", () => {
        if (!isUnmountedRef.current) {
          setCallStarted(false);
          setCurrentRole(null);
          setCurrentTranscript("");
          setConnectionStatus("Call ended");
        }
      });

      vapi.on("speech-start", () => {
        if (!isUnmountedRef.current) {
          setConnectionStatus("Speaking...");
        }
      });

      vapi.on("speech-end", () => {
        if (!isUnmountedRef.current) {
          setConnectionStatus("Listening...");
        }
      });

      vapi.on("message", (message: Message) => {
        if (isUnmountedRef.current) return;

        switch (message.type) {
          case "transcript": {
            const { role, transcriptType, transcript } = message;

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
            }
            break;
          }
          case "conversation-update":
            console.warn("Conversation update:", message);
            break;
          default:
            console.warn("Unknown message type:", message.type);
        }
      });

      vapi.on("error", (error: Error) => {
        console.error("Vapi error:", error);
        const errorMessage = error.message || "Unknown error";
        if (!isUnmountedRef.current) {
          setConnectionStatus(`Error: ${errorMessage}`);
        }
        toast.error(`Call error: ${errorMessage}`);
      });

      await vapi.start(assistantId);
    } catch (error) {
      console.error("Call start error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (!isUnmountedRef.current) {
        setConnectionStatus(`Error: ${errorMessage}`);
      }
      toast.error(`Call error: ${errorMessage}`);
    }
  }, [assistantId, microphoneAccess, callStarted, createHistory]);

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
        setConnectionStatus("Call ended");
        setCurrentRole(null);
        setCurrentTranscript("");
        toast.info("Call ended. Generating report...", {
          icon: <Loader2 className="size-sm animate-spin" />,
        });

        setTimeout(async () => {
          await updateHistory();
          if (interviewConfig && interviewConfig?.estimated_time > 300) {
            await generateReport();
          }
        }, 1000);
      }
    }
  }, [callStarted, updateHistory, generateReport]);

  useEffect(() => {
    if (id) {
      fetchInterviewConfig();
    }
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
      const autoStartTimer = setTimeout(() => {
        // startCall();
      }, 1000);

      return () => clearTimeout(autoStartTimer);
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

  const sessionCardElem = useMemo(
    () => [
      {
        avatar: (
          <Avatar className="bg-primary h-24 w-24">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/70">
              <Bot size={40} />
            </AvatarFallback>
          </Avatar>
        ),
        role: "assistant",
        name: "AI Assistant",
        isSpeaking: currentRole === "assistant",
      },
      {
        avatar: (
          <Avatar className="h-24 w-24">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || (
                <User size={40} />
              )}
            </AvatarFallback>
          </Avatar>
        ),
        role: "user",
        name: session?.user?.name || "User",
        isSpeaking: currentRole === "user",
      },
    ],
    [session, currentRole],
  );

  if (loading && !interviewConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">No Interview ID</h1>
          <p className="text-gray-600">Please provide a valid interview ID</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <section className="mx-auto flex max-w-6xl flex-col rounded-xl md:p-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl/8">
            {interviewConfig?.topic || "Loading..."}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-xs md:text-base">
            {interviewConfig?.description || "Loading interview details..."}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full flex-col items-start justify-start gap-2 sm:flex-row">
            <div
              className={`flex items-center gap-2 rounded-full border-2 border-white p-2 ring-2 ${
                callStarted
                  ? "bg-green-500/30 ring-green-500"
                  : "bg-yellow-500/30 ring-yellow-500"
              }`}
            >
              <Circle
                fill="currentColor"
                className={callStarted ? "text-green-500" : "text-yellow-500"}
                size={16}
              />
              <p
                className={`text-xs md:text-sm ${callStarted ? "text-green-700" : "text-yellow-700"}`}
              >
                {connectionStatus}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full border-2 border-white p-2 ring-2 ${
                microphoneAccess
                  ? "bg-green-500/30 ring-green-500"
                  : "bg-red-500/30 ring-red-500"
              }`}
            >
              <Mic
                className={microphoneAccess ? "text-green-500" : "text-red-500"}
                size={16}
              />
              <p
                className={`text-xs md:text-sm ${microphoneAccess ? "text-green-700" : "text-red-700"}`}
              >
                {microphoneAccess ? "Mic Active" : "Mic Disabled"}
              </p>
            </div>
            {sessionStartTime && callStarted && (
              <div className="flex items-center gap-2 rounded-full border-2 border-white bg-blue-500/30 p-2 ring-2 ring-blue-500">
                <Circle
                  fill="currentColor"
                  className="text-blue-500"
                  size={16}
                />
                <p className="text-xs text-blue-700 md:text-sm">
                  Started: {sessionStartTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 self-start">
            {!callStarted && assistantId && microphoneAccess && (
              <Button
                onClick={startCall}
                className={cn("cursor-pointer bg-green-500 text-white hover:bg-green-600/70", loading && "cursor-not-allowed opacity-50")}
                variant={"outline"}
                disabled={loading}
              >
                <Phone />
                Start Interview
              </Button>
            )}
            {callStarted && (
              <Button
                onClick={endCall}
                variant="destructive"
                className="flex items-center gap-2 rounded-full"
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Phone className="rotate-[135deg]" />
                )}
                {isGeneratingReport ? "Generating Report..." : "End Session"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            {sessionCardElem.map((card, i) => (
              <SessionCard key={i} {...card} />
            ))}
          </div>
          <div className="lg:col-span-2">
            <Transcript
              liveTranscription={currentTranscript}
              transcripts={messages}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default SessionPage;
