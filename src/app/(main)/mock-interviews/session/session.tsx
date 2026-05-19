"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MessageSquare,
  Globe,
  ChevronRight,
} from "lucide-react";

import type { MockInterviews, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Language types ────────────────────────────────────────────────────────

type SupportedLanguage = "english" | "urdu" | "hindi";

interface LanguageOption {
  id: SupportedLanguage;
  label: string;
  nativeLabel: string;
  description: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: "english",
    label: "English",
    nativeLabel: "English",
    description: "Interview conducted fully in English",
    flag: "🇬🇧",
  },
  {
    id: "urdu",
    label: "Urdu",
    nativeLabel: "اردو",
    description: "انٹرویو مکمل طور پر اردو میں ہوگا",
    flag: "🇵🇰",
  },
  {
    id: "hindi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    description: "इंटरव्यू पूरी तरह हिंदी में होगा",
    flag: "🇮🇳",
  },
];

// ─── Language picker screen ────────────────────────────────────────────────

const LanguagePicker = ({
  topic,
  onSelect,
}: {
  topic: string;
  onSelect: (lang: SupportedLanguage) => void;
}) => {
  const [hovered, setHovered] = useState<SupportedLanguage | null>(null);

  return (
    <div className="bg-background flex min-h-screen w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <div className="border-border bg-secondary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border">
            <Globe className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-foreground font-serif text-3xl font-black tracking-tight">
            Choose your language
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {topic ? (
              <>
                Your interview on{" "}
                <span className="text-foreground font-medium">{topic}</span>{" "}
                will be conducted in the language you select.
              </>
            ) : (
              <>Your interview will be conducted in the language you select.</>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              onMouseEnter={() => setHovered(lang.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border px-5 py-4 text-left transition-all duration-200",
                hovered === lang.id
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/20",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300",
                  hovered === lang.id ? "opacity-100" : "opacity-0",
                )}
                style={{
                  background:
                    "radial-gradient(ellipse at 0% 50%, var(--primary) 0%, transparent 60%)",
                  opacity: hovered === lang.id ? 0.04 : 0,
                }}
              />
              <span className="shrink-0 text-2xl">{lang.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground font-semibold">
                    {lang.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm",
                      lang.id === "urdu" || lang.id === "hindi"
                        ? "text-base"
                        : "",
                      "text-muted-foreground",
                    )}
                  >
                    {lang.nativeLabel}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {lang.description}
                </p>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-200",
                  hovered === lang.id
                    ? "text-primary translate-x-0.5"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>

        <p className="text-muted-foreground mt-6 text-center font-mono text-[10px] tracking-wider uppercase">
          Language cannot be changed once the interview begins
        </p>
      </div>
    </div>
  );
};

// ─── Main session page ─────────────────────────────────────────────────────

const SessionPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [interviewConfig, setInterviewConfig] = useState<MockInterviews | null>(
    null,
  );
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
  const [currentRole, setCurrentRole] = useState<"user" | "assistant" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const isUnmountedRef = useRef(false);
  const isBootstrappedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const interviewConfigRef = useRef<MockInterviews | null>(null);

  const isEndingCallRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    sessionStartTimeRef.current = sessionStartTime;
  }, [sessionStartTime]);
  useEffect(() => {
    interviewConfigRef.current = interviewConfig;
  }, [interviewConfig]);

  // ─── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStarted && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - sessionStartTime.getTime()) / 1000),
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted, sessionStartTime]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  const fetchFullConfig = useCallback(async () => {
    if (!id) return null;
    try {
      const { data: response } = await axios.get(
        `/api/mock-interview/get/${id}`,
      );
      const interview = response?.data ?? null;
      if (!interview) throw new Error("Invalid interview response");
      setInterviewConfig(interview);
      console.log(interview);
      return interview;
    } catch (error) {
      console.error("Error fetching the interview config", error);
      return null;
    }
  }, [id]);

  useEffect(() => {
    fetchFullConfig();
  }, [fetchFullConfig]);

  // ─── Helpers ────────────────────────────────────────────────────────────
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

  // ─── History helpers ─────────────────────────────────────────────────────
  const createHistory = useCallback(
    async (startTime: Date) => {
      if (!id) return;
      try {
        await axios.post(`/api/mock-interview/history`, {
          interviewId: id,
          status: "ongoing",
          startTime: startTime.toISOString(),
        });
      } catch (err) {
        console.error("[session] Failed to create history:", err);
      }
    },
    [id],
  );

  const updateHistory = useCallback(
    async (startTime: Date) => {
      if (!id) return;
      try {
        const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
        await axios.post(`/api/mock-interview/history`, {
          interviewId: id,
          status: "completed",
          startTime: startTime.toISOString(),
          duration,
        });
      } catch (err) {
        console.error("[session] Failed to update history:", err);
      }
    },
    [id],
  );

  // ─── End call ───────────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    if (isEndingCallRef.current) return;
    isEndingCallRef.current = true;

    const startTime = sessionStartTimeRef.current;
    const msgs = messagesRef.current;
    const config = interviewConfigRef.current;

    try {
      if (vapiRef.current) await vapiRef.current.stop();
    } catch (err) {
      console.error("[session] Error stopping call:", err);
    }

    if (!isUnmountedRef.current) return;

    setCallStarted(false);
    setConnectionStatus("disconnected");
    setSpeakingStatus("idle");
    setCurrentTranscript("");
    setCurrentRole(null);

    if (!startTime || !config) return;

    const actualDurationSecs = (Date.now() - startTime.getTime()) / 1000;
    await updateHistory(startTime);

    if (msgs.length === 0) {
      toast.info("No conversation recorded — redirecting...");
      setTimeout(() => router.replace("/mock-interviews"), 1200);
      return;
    }

    toast.info("Interview completed — generating your report...");
    setIsGeneratingReport(true);

    try {
      const duration = Math.floor(actualDurationSecs / 60);
      const res = await axios.post(`/api/mock-interview/report`, {
        transcripts: msgs.map((m) => ({ role: m.role, content: m.transcript })),
        conversationId: id,
        focusedSkills: config.focus || [],
        duration,
        topic: config.topic,
      });

      if (res.status === 200 && res.data?.data?.reportId) {
        await axios
          .patch(`/api/mock-interview/${id}/complete`)
          .catch((err) =>
            console.error("[session] Failed to mark complete:", err),
          );
        router.replace(`/report/?reportId=${res.data.data.reportId}`);
      } else {
        throw new Error("Invalid report response");
      }
    } catch (err) {
      console.error("[session] Failed to generate report:", err);
      toast.error("Failed to generate report — please try again");
      setIsGeneratingReport(false);
      isEndingCallRef.current = false;
    }
  }, [id, router, updateHistory]);

  // ─── Check microphone access ─────────────────────────────────────────────────────────

  const checkMic = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      stream.getTracks().forEach((t) => t.stop());
      if (isUnmountedRef.current) setMicrophoneAccess(true);
      return true;
    } catch {
      if (isUnmountedRef.current) setMicrophoneAccess(false);
      toast.error("Microphone access is required for the interview");
      return false;
    }
  }, []);

  // ─── Start call ─────────────────────────────────────────────────────────
  const startCallWithId = useCallback(
    async (aid: string, config: MockInterviews) => {
      if (!aid) return;

      try {
        setConnectionStatus("connecting");
        const startTime = new Date();
        setSessionStartTime(startTime);
        sessionStartTimeRef.current = startTime;

        if (!vapiRef.current) {
          const apiKey = process.env.NEXT_PUBLIC_VAPI_AI_API_KEY;
          if (!apiKey) throw new Error("VAPI API key not configured");
          vapiRef.current = new Vapi(apiKey);
        }

        const vapi = vapiRef.current;
        vapi.removeAllListeners();

        vapi.on("call-start", async () => {
          if (!isUnmountedRef.current) return;
          setCallStarted(true);
          setConnectionStatus("connected");
          await createHistory(startTime);

          if (config.estimated_time) {
            setTimeout(
              () => {
                if (!isUnmountedRef.current) endCall();
              },
              config.estimated_time * 60 * 1000,
            );
          }
        });

        vapi.on("call-end", () => {
          if (!isUnmountedRef.current) return;
          setCallStarted(false);
          setConnectionStatus("disconnected");
          setSpeakingStatus("idle");
          setCurrentTranscript("");
          setCurrentRole(null);
        });

        vapi.on("speech-start", () => {
          if (isUnmountedRef.current) setSpeakingStatus("ai-speaking");
        });

        vapi.on("speech-end", () => {
          if (isUnmountedRef.current) setSpeakingStatus("idle");
        });

        vapi.on("message", (message: Message) => {
          if (!isUnmountedRef.current) return;
          if (message.type !== "transcript") return;

          const { role, transcriptType, transcript } = message;

          if (role === "user") setSpeakingStatus("user-speaking");

          if (transcriptType === "partial") {
            setCurrentTranscript(transcript);
            setCurrentRole(role as "user" | "assistant");
          } else if (transcriptType === "final") {
            setMessages((prev) => {
              if (
                prev.some((m) => m.role === role && m.transcript === transcript)
              )
                return prev;
              const next = [...prev, { role, transcript }];
              messagesRef.current = next;
              return next;
            });
            setCurrentTranscript("");
            setCurrentRole(null);
            if (role === "user") setSpeakingStatus("idle");
          }
        });

        vapi.on("error", (error: unknown) => {
          console.error("[vapi] Error:", error);

          const err = error as {
            error?: {
              message?: { type?: string; msg?: string } | string;
              type?: string;
            };
            message?: string;
          };

          const type: string =
            (typeof err?.error?.message === "object"
              ? err?.error?.message?.type
              : undefined) ??
            err?.error?.type ??
            err?.message ??
            "";

          const isEjection =
            type.toLowerCase().includes("eject") ||
            type.toLowerCase().includes("ended");

          if (isEjection) {
            if (!isUnmountedRef.current) endCall();
            return;
          }

          if (!isUnmountedRef.current) setConnectionStatus("error");

          const userMsg: string =
            (typeof err?.error?.message === "object"
              ? err?.error?.message?.msg
              : err?.error?.message) ??
            err?.message ??
            "Unknown call error";

          toast.error(`Call error: ${userMsg}`);
        });

        await vapi.start(aid);
      } catch (error) {
        console.error("[session] Call start error:", error);
        setConnectionStatus("error");
        toast.error("Failed to start call");
      }
    },
    [createHistory, endCall],
  );

  // ─── Bootstrap (runs after language is selected + auth is ready) ────────
  const bootstrap = useCallback(
    async (language: SupportedLanguage, config: MockInterviews) => {
      const candidateName =
        session?.user?.name ?? session?.user?.email ?? "Candidate";
      if (
        !id ||
        status !== "authenticated" ||
        !session?.user ||
        isBootstrappedRef.current
      )
        return;
      isBootstrappedRef.current = true;
      setLoading(true);
      console.log(`[bootstrap] Starting bootstrap for interview ${id} with language ${language}`);

      const micOk = await checkMic();
      console.log(`[bootstrap] Microphone check result: ${micOk}`);
      if (!isUnmountedRef.current) return;

      console.log("[bootstrap] Microphone access status:", micOk);

      if (!micOk) {
        setLoading(false);
        isBootstrappedRef.current = false;
        return;
      }
      console.log("[bootstrap] Microphone access granted");

      if (config.markAsCompleted) {
        toast.info("This interview has already been completed.");
        setLoading(false);
        router.replace("/mock-interviews");
        return;
      }

      setConnectionStatus("connecting");

      try {
        const assistantRes = await axios.post(`/api/assistant/`, {
          ...config,
          candidateName,
          language,
        });

        if (!assistantRes.data?.data?.id)
          throw new Error("Invalid assistant response — missing ID");

        const aid = assistantRes.data.data.id as string;
        console.log("[bootstrap] Assistant created with ID before startCallWithId:", aid);

        if (isUnmountedRef.current) {
          setAssistantId(aid);
          setLoading(false);
          startCallWithId(aid, config);
          console.log("[bootstrap] Assistant created with ID:", aid);
        }
      } catch (err) {
        console.error("[bootstrap] Assistant creation failed:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to initialize assistant",
        );
        if (!isUnmountedRef.current) {
          setConnectionStatus("error");
          setLoading(false);
        }
        isBootstrappedRef.current = false;
      }
    },
    [id, status, session, startCallWithId, router, checkMic, isUnmountedRef],
  );

  // ─── Trigger bootstrap once language is picked and auth is settled ───────
  useEffect(() => {
    if (
      !selectedLanguage ||
      !interviewConfig || // ← wait for config to actually be fetched
      !id ||
      status !== "authenticated" ||
      !session?.user?.name ||
      isBootstrappedRef.current
    )
      return;

    bootstrap(selectedLanguage, interviewConfig);
  }, [
    selectedLanguage,
    interviewConfig,
    id,
    status,
    session?.user?.name,
    bootstrap,
  ]);

  // ─── Manual toggles ──────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      setIsMuted((prev) => {
        const next = !prev;
        vapiRef.current?.setMuted(next);
        return next;
      });
    }
  }, []);

  const handleLanguageSelect = useCallback((lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
  }, []);

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      try {
        vapiRef.current?.stop();
        vapiRef.current?.removeAllListeners();
      } catch (err) {
        console.error("[session] Cleanup error:", err);
      }
    };
  }, []);

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-destructive text-2xl font-bold">
              No Interview ID
            </h1>
            <p className="text-muted-foreground mt-2">
              Please provide a valid interview ID
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mock-interviews")}
            >
              Go to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedLanguage) {
    return (
      <LanguagePicker
        topic={interviewConfig?.topic ?? ""}
        onSelect={handleLanguageSelect}
      />
    );
  }

  if (loading && !interviewConfig) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Setting up your interview...
        </p>
      </div>
    );
  }

  if (isGeneratingReport) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
        <h2 className="mt-6 text-2xl font-bold">Analyzing your interview...</h2>
        <p className="text-muted-foreground mt-2">
          Please wait while we generate your feedback report
        </p>
      </div>
    );
  }

  const isAiSpeaking = speakingStatus === "ai-speaking";
  const isUserSpeaking = speakingStatus === "user-speaking";

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5">
      {/* ── Header ── */}
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
              className={cn(
                "text-xs uppercase",
                getDifficultyColor(interviewConfig?.difficulty || ""),
              )}
            >
              {interviewConfig?.difficulty || "Unknown"}
            </Badge>
            {interviewConfig?.focus?.length ? (
              <Badge variant="outline" className="text-xs">
                {interviewConfig.focus.join(", ")}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="gap-1 text-xs">
              {LANGUAGE_OPTIONS.find((l) => l.id === selectedLanguage)?.flag}{" "}
              {
                LANGUAGE_OPTIONS.find((l) => l.id === selectedLanguage)
                  ?.nativeLabel
              }
            </Badge>
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
              connectionStatus === "connected" &&
                "border-green-200 bg-green-50 text-green-700",
              connectionStatus === "connecting" &&
                "border-yellow-200 bg-yellow-50 text-yellow-700",
              connectionStatus === "error" &&
                "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {connectionStatus === "connected" ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : connectionStatus === "connecting" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
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
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={
              callStarted
                ? endCall
                : () =>
                    assistantId &&
                    interviewConfig &&
                    startCallWithId(assistantId, interviewConfig)
            }
            disabled={!assistantId || (!callStarted && !microphoneAccess)}
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

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* ── Avatar cards ── */}
        <div className="flex shrink-0 flex-row gap-3 lg:w-72 lg:flex-col xl:w-80">
          {/* AI card */}
          <div
            className={cn(
              "bg-card relative flex flex-1 flex-col items-center justify-center rounded-xl border p-4 transition-all duration-300",
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
                    "h-7 w-7 transition-colors duration-300 md:h-9 md:w-9",
                    isAiSpeaking ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </div>
            </div>
            <p className="text-foreground text-sm font-semibold">
              AI Interviewer
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {isAiSpeaking ? "Speaking..." : "Listening"}
            </p>
            <div
              className="mt-3 flex items-end gap-0.5"
              style={{ height: "20px" }}
            >
              {[...Array(5)].map((_, i) =>
                isAiSpeaking ? (
                  <span
                    key={i}
                    className="wave-bar inline-block w-1 rounded-full"
                    style={{
                      height: "100%",
                      background: "var(--primary)",
                      transformOrigin: "bottom",
                    }}
                  />
                ) : (
                  <span
                    key={i}
                    className="inline-block w-1 rounded-full"
                    style={{
                      height: "30%",
                      background: "var(--muted-foreground)",
                      opacity: 0.3,
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* User card */}
          <div
            className={cn(
              "bg-card relative flex flex-1 flex-col items-center justify-center rounded-xl border p-4 transition-all duration-300",
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
                  isUserSpeaking
                    ? "border-blue-400 bg-blue-50"
                    : "border-border bg-secondary",
                )}
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "You"}
                    className="h-full w-full object-cover"
                    
                  />
                ) : (
                  <User
                    className={cn(
                      "h-7 w-7 transition-colors duration-300 md:h-9 md:w-9",
                      isUserSpeaking
                        ? "text-blue-500"
                        : "text-muted-foreground",
                    )}
                  />
                )}
              </div>
            </div>
            <p className="text-foreground text-sm font-semibold">
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
            <div
              className="mt-3 flex items-end gap-0.5"
              style={{ height: "20px" }}
            >
              {[...Array(5)].map((_, i) =>
                isUserSpeaking ? (
                  <span
                    key={i}
                    className="wave-bar inline-block w-1 rounded-full"
                    style={{
                      height: "100%",
                      background: "#3b82f6",
                      transformOrigin: "bottom",
                    }}
                  />
                ) : (
                  <span
                    key={i}
                    className="inline-block w-1 rounded-full"
                    style={{
                      height: "30%",
                      background: "var(--muted-foreground)",
                      opacity: 0.3,
                    }}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── Transcript panel ── */}
        <div className="bg-card flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border shadow-sm">
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
                <div className="bg-secondary rounded-full p-4">
                  <MessageSquare className="text-muted-foreground h-6 w-6" />
                </div>
                <p className="text-muted-foreground max-w-xs text-center text-sm">
                  {loading
                    ? "Setting up your interview session..."
                    : "Start the interview to see the conversation transcript here."}
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
                          <Image
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
                          : "border-border bg-secondary text-secondary-foreground rounded-bl-sm border",
                      )}
                    >
                      {msg.transcript}
                    </div>
                  </div>
                ))}

                {currentTranscript && currentRole && (
                  <div
                    className={cn(
                      "flex items-end gap-2.5",
                      currentRole === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        currentRole === "user"
                          ? "border-blue-200 bg-blue-50"
                          : "border-primary/20 bg-primary/10",
                      )}
                    >
                      {currentRole === "user" ? (
                        session?.user?.image ? (
                          <Image
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
                        "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed italic opacity-70",
                        currentRole === "user"
                          ? "rounded-br-sm bg-blue-400/70 text-white"
                          : "border-border bg-secondary text-secondary-foreground rounded-bl-sm border",
                      )}
                    >
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
