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

import type { PracticeInterview, Message } from "@/lib/types";

const SessionPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [interviewConfig, setInterviewConfig] =
    useState<PracticeInterview | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Waiting...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPageActive = useRef(true);
  const hasAutoStarted = useRef(false);

  // Cleanup function that stops everything
  const cleanup = useCallback(async () => {
    console.log("🧹 Cleaning up session...");
    isPageActive.current = false;

    try {
      // Stop VAPI call
      if (vapiRef.current) {
        await vapiRef.current.stop();
        vapiRef.current = null;
      }

      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("Stopped microphone track");
        });
        streamRef.current = null;
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }

    // Reset states
    setCallStarted(false);
    setMicrophoneAccess(false);
    setCurrentRole(null);
    setCurrentTranscript("");
  }, []);

  // Page visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("👀 Page hidden - stopping call");
        cleanup();
      }
    };

    const handleBeforeUnload = () => {
      console.log("🚪 Page unloading - stopping call");
      cleanup();
    };

    // Add event listeners for page visibility and navigation
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      cleanup();
    };
  }, [cleanup]);

  // Note: App Router doesn't support router.events like Pages Router
  // Navigation cleanup is handled through the beforeunload and pagehide events above
  // If you need route change detection, you would need to implement it differently
  // using usePathname() and useEffect to track path changes

  // --- Fetch interview config ---
  const fetchInterviewConfig = useCallback(async () => {
    if (!id) {
      toast.error("No interview ID provided");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/mock-interview/get/id?id=${id}`);
      if (res.status === 200) {
        setInterviewConfig(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch interview config:", err);
      toast.error("Failed to load interview configuration");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // --- Get assistant ID from API ---
  const getAssistantId = useCallback(async () => {
    if (!interviewConfig || !session?.user?.name || !isPageActive.current) {
      return;
    }

    try {
      setConnectionStatus("Creating assistant...");
      const res = await axios.post(`/api/assistant/`, {
        ...interviewConfig,
        candidateName: session.user.name,
      });

      if (!isPageActive.current) return; // Stop if page is no longer active

      if (res.status !== 200 && res.status !== 201) {
        toast.error(res.data?.message || "Failed to get assistant ID");
        return;
      }

      if (!res.data?.data?.id) {
        toast.error("Invalid assistant response - missing ID");
        return;
      }

      console.log("Assistant created:", res.data.data.id);
      setAssistantId(res.data.data.id);
    } catch (err) {
      if (!isPageActive.current) return;
      console.error("Assistant creation failed:", err);
      toast.error("Failed to initialize assistant");
      setConnectionStatus("Assistant initialization failed");
    }
  }, [interviewConfig, session]);

  // --- Request Mic Access ---
  const requestMicrophonePermission =
    useCallback(async (): Promise<boolean> => {
      if (!isPageActive.current) {
        console.log("Page not active, skipping mic request");
        return false;
      }

      try {
        console.log("Requesting microphone permission...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        });

        if (!isPageActive.current) {
          // If page became inactive while requesting, stop the stream
          stream.getTracks().forEach((track) => track.stop());
          return false;
        }

        streamRef.current = stream;
        console.log("Microphone stream obtained:", stream.getAudioTracks());

        setMicrophoneAccess(true);
        setConnectionStatus("Microphone access granted");
        return true;
      } catch (error) {
        if (!isPageActive.current) return false;

        console.error("Microphone permission error:", error);
        setMicrophoneAccess(false);
        setConnectionStatus(
          "Microphone permission denied. Please allow mic access and refresh.",
        );
        toast.error("Microphone access is required for the interview");
        return false;
      }
    }, []);

  // --- Start call ---
  const startCall = useCallback(async () => {
    if (!assistantId || !isPageActive.current) {
      console.log("Cannot start call - missing assistant or page inactive");
      return;
    }

    try {
      console.log("Starting call with assistant:", assistantId);
      setConnectionStatus("Starting call...");

      if (!vapiRef.current) {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_AI_API_KEY;
        if (!apiKey) {
          throw new Error("VAPI API key not configured");
        }
        vapiRef.current = new Vapi(apiKey);
      }

      const vapi = vapiRef.current;

      // Clear any existing listeners
      vapi.removeAllListeners();

      // Set up event listeners with page active checks
      vapi.on("call-start", () => {
        if (!isPageActive.current) return;
        console.log("Call started");
        setCallStarted(true);
        setConnectionStatus("Call active - You can speak now");
      });

      vapi.on("call-end", () => {
        if (!isPageActive.current) return;
        console.log("Call ended");
        setCallStarted(false);
        setCurrentRole(null);
        setCurrentTranscript("");
        setConnectionStatus("Call ended");
      });

      vapi.on("speech-start", () => {
        if (!isPageActive.current) return;
        console.log("Speech started");
        setConnectionStatus("Listening...");
      });

      vapi.on("speech-end", () => {
        if (!isPageActive.current) return;
        console.log("Speech ended");
        setConnectionStatus("Processing...");
      });

      vapi.on("message", (message: any) => {
        if (!isPageActive.current) return;
        console.log("Vapi message:", message);

        switch (message.type) {
          case "transcript": {
            const { role, transcriptType, transcript } = message;
            console.log(`Transcript (${transcriptType}):`, {
              role,
              transcript,
            });

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
            console.log("Conversation update:", message);
            break;
          default:
            console.log("Unknown message type:", message.type);
        }
      });

      vapi.on("error", (error: any) => {
        if (!isPageActive.current) return;
        console.error("Vapi error:", error);
        setConnectionStatus(`Error: ${error.message || "Unknown error"}`);
        toast.error(`Call error: ${error.message || "Unknown error"}`);
      });

      // Start the call only if page is still active
      if (isPageActive.current) {
        await vapi.start(assistantId);
        hasAutoStarted.current = true;
      }
    } catch (error: any) {
      if (!isPageActive.current) return;
      console.error("Call error:", error);
      setConnectionStatus(`Error: ${error.message || "Unknown error"}`);
      toast.error(`Call error: ${error.message || "Unknown error"}`);
    }
  }, [assistantId]);

  // --- End call ---
  const endCall = useCallback(async () => {
    await cleanup();
    if (isPageActive.current) {
      toast.info("Call ended. Redirecting to dashboard...");
    }
    router.replace(`/report/${id}`, {
      scroll: false,
    });
  }, [cleanup, router]);

  // --- Effects ---
  useEffect(() => {
    if (id) {
      fetchInterviewConfig();
    }
  }, [id, fetchInterviewConfig]);

  useEffect(() => {
    if (interviewConfig && session?.user?.name && isPageActive.current) {
      getAssistantId();
    }
  }, [interviewConfig, session, getAssistantId]);

  // Auto-start effect - only runs once when assistant is ready
  useEffect(() => {
    const autoStart = async () => {
      if (
        assistantId &&
        !callStarted &&
        !hasAutoStarted.current &&
        isPageActive.current
      ) {
        console.log("🚀 Auto-starting interview...");

        const hasAccess = await requestMicrophonePermission();
        if (hasAccess && isPageActive.current) {
          // Small delay to ensure mic is ready
          setTimeout(() => {
            if (isPageActive.current && !hasAutoStarted.current) {
              startCall();
            }
          }, 1000);
        }
      }
    };

    autoStart();
  }, [assistantId, callStarted, requestMicrophonePermission, startCall]);

  // --- Memoized avatars ---
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <section className="mx-auto flex max-w-6xl flex-col rounded-xl bg-white p-6 shadow-lg md:p-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl/8">
            {interviewConfig?.topic || "Loading..."}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-lg">
            {interviewConfig?.description || "Loading interview details..."}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`flex items-center gap-2 rounded-xl p-2 ring-2 ${
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
              className={`flex items-center gap-2 rounded-xl p-2 ring-2 ${
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
          </div>

          <div className="flex gap-2 self-start">
            {callStarted && (
              <Button
                onClick={endCall}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Phone className="rotate-[135deg]" />
                End Session
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
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
