"use client";
import AI from "@/components/session/ai";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bot,
  Mic,
  MicOff,
  MonitorUp,
  MonitorX,
  PhoneOff,
  Send,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Transcript {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
}

interface ActionButtons {
  icon: React.ComponentType;
  label: string;
  disabled: boolean;
  disabledIcon: React.ComponentType;
}

interface MediaState {
  video: boolean;
  audio: boolean;
  screenShare: boolean;
}

const InterviewSessionPage = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([
    {
      id: "1",
      message:
        "Welcome to your interview session! I'm here to help you practice and improve your interview skills.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [mediaState, setMediaState] = useState<MediaState>({
    video: false,
    audio: false,
    screenShare: false,
  });

  const [message, setMessage] = useState<string>("");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // URL params
  const params = useSearchParams();
  const sessionId = params.get("id");

  const initializeVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoStream(stream);
      setMediaState((prev) => ({ ...prev, video: true, audio: true }));

      // Set video source when stream is ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error("Failed to initialize video:", error);
      setMediaState((prev) => ({ ...prev, video: false, audio: false }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const handleSend = useCallback(async () => {
    setIsLoading(true)
    try {
      const message = textareaRef.current?.value;
      textareaRef.current!.value = "";
      if (!message) return;
      setTranscripts((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          message,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setMessage("");
      setTimeout(async () => {
        setTranscripts((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            message: "Thanks for starting the interview",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }, 2000);
      if (!transcriptRef.current) return;
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  }, [textareaRef, transcriptRef.current]);

  const toggleVideo = useCallback(() => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        const newVideoState = !mediaState.video;
        videoTrack.enabled = newVideoState;
        setMediaState((prev) => ({ ...prev, video: newVideoState }));

        if (videoRef.current) {
          if (newVideoState) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.play().catch(console.error);
          } else {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
          }
        }
      }
    }
  }, [videoStream, mediaState.video]);

  const toggleAudio = useCallback(() => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !mediaState.audio;
        setMediaState((prev) => ({ ...prev, audio: !prev.audio }));
      }
    }
  }, [videoStream, mediaState.audio]);

  const toggleScreenShare = useCallback(async () => {
    if (mediaState.screenShare) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setMediaState((prev) => ({ ...prev, screenShare: false }));
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        setMediaState((prev) => ({ ...prev, screenShare: true }));

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setMediaState((prev) => ({ ...prev, screenShare: false }));
        };
      } catch (error) {
        console.error("Failed to start screen sharing:", error);
      }
    }
  }, [mediaState.screenShare, screenStream]);

  const endSession = useCallback(() => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setMediaState({ video: false, audio: false, screenShare: false });
    alert("Session ended");
  }, [videoStream, screenStream]);

  useEffect(() => {
    initializeVideo();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    if (screenRef.current && screenStream) {
      screenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcripts]);

  const actionButtons = [
    {
      icon: mediaState.video ? Video : VideoOff,
      label: "Toggle Video",
      action: toggleVideo,
      active: mediaState.video,
    },
    {
      icon: mediaState.audio ? Mic : MicOff,
      label: "Toggle Audio",
      action: toggleAudio,
      active: mediaState.audio,
    },
    {
      icon: mediaState.screenShare ? MonitorX : MonitorUp,
      label: "Screen Share",
      action: toggleScreenShare,
      active: mediaState.screenShare,
    },
    {
      icon: PhoneOff,
      label: "End Session",
      action: endSession,
      active: false,
      variant: "destructive" as const,
    },
  ];

  return (
    <Container>
      <section className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text mb-4">
            Interview Session
          </h1>
          <p className="text-muted-foreground text-sm">
            Session ID: {sessionId}
          </p>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:p-4">
          {mediaState.screenShare && (
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorUp className="h-5 w-5" />
                  Screen Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={screenRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                  />
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain rotate-y-180"
                  autoPlay
                  playsInline
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AI />
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="bg-primary/3 md:p-4 p-2 grid grid-cols-1 md:grid-cols-2 rounded-xl">
        <div className="w-full ml-auto">
          <div className="action-buttons ">
            <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
              Actions
            </h2>
            <div className="bg-primary-30 p-8 rounded-xl w-full flex items-center justify-center">
              <div className="flex items-center justify-around gap-2 p-4 rounded-xl shadow-lg bg-primary/10 md:w-2/3 w-full">
                {actionButtons.map((action, idx) => {
                  return (
                    <Tooltip key={`action-tooltip-${idx}`}>
                      <TooltipTrigger asChild>
                        <Button
                          className="cursor-pointer"
                          size={"lg"}
                          variant={idx < 3 ? "ghost" : "default"}
                          onClick={action.action}
                        >
                          <action.icon size={24} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mr-auto w-full">
          <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
            Transcript
          </h2>
          <Card className="h-max w-full rounded-xl p-4 mt-4">
            <ScrollArea className="h-[40vh]">
              <div ref={transcriptRef} className="h-60">
                {transcripts.map((transcript, idx) => (
                  <div
                    key={`transcript-${idx}`}
                    className={`flex items-center gap-2 mt-2 ${transcript.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full overflow-hidden ${transcript.sender === "user" ? "order-2" : "order-1"}`}
                    >
                      <img
                        src="/images/interviewer.jpg"
                        alt="user"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`p-2 rounded-xl ${transcript.sender === "user" ? "order-2 bg-primary/10 rounded-br-none" : "order-1 bg-gray-100 rounded-bl-none"}`}
                    >
                      <p>{transcript.message}</p>
                      <p className="text-xs text-gray-500">{transcript.timestamp.toLocaleTimeString()}</p>
                      {isLoading && idx === transcripts.length - 1 && (
                        <p className="text-xs text-gray-500">AI is thinking...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="resize-none"
                placeholder="Ask a question"
                ref={textareaRef}
              />
              <Button onClick={handleSend} size={"icon"}>
                <Send />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </Container>
  );
};

export default InterviewSessionPage;
