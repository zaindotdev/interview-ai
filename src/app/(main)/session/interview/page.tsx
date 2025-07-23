"use client";
import ActionButtons from "@/components/session/action-buttons";
import AI from "@/components/session/ai";
import Transcript from "@/components/session/transcript";
import Container from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/context/socket-provider";
import { Bot, MonitorUp, User } from "lucide-react";
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
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaState, setMediaState] = useState<MediaState>({
    video: false,
    audio: false,
    screenShare: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { socket, transcript } = useSocket();

  // Local Stream
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);

  // Remote Stream
  const [remoteVideoStream, setRemoteVideoStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // URL params
  const params = useSearchParams();
  const sessionId = params?.get("id");

  const initializeVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalVideoStream(stream);
      setMediaState((prev) => ({ ...prev, video: true }));

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
    if (videoRef.current && localVideoStream) {
      videoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      if (!socket) return;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && event.data.type) {
          const arrayBuffer = await event.data.arrayBuffer();
          socket.emit("audio-chunk", new Uint8Array(arrayBuffer));
          console.log("audio-chunk", new Uint8Array(arrayBuffer));
        }
      };
      mediaRecorder.start(1000);
      setRecording(true);
    } catch (error) {
      console.error(error);
    }
  }, [socket]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const toggleVideo = useCallback(() => {
    if (localVideoStream) {
      const videoTrack = localVideoStream.getVideoTracks()[0];
      if (videoTrack) {
        const newVideoState = !mediaState.video;
        videoTrack.enabled = newVideoState;
        setMediaState((prev) => ({ ...prev, video: newVideoState }));

        if (videoRef.current) {
          if (newVideoState) {
            videoRef.current.srcObject = localVideoStream;
            videoRef.current.play().catch(console.error);
          } else {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
          }
        }
      }
    }
  }, [localVideoStream, mediaState.video]);

  const toggleAudio = useCallback(() => {
    if (localVideoStream) {
      const audioTrack = localVideoStream.getAudioTracks()[0];
      if (audioTrack) {
        const newAudioState = !mediaState.audio;
        audioTrack.enabled = newAudioState;
        setMediaState((prev) => ({ ...prev, audio: newAudioState }));

        if (newAudioState && !recording) startRecording();
        if (!newAudioState && recording) stopRecording();
      }
    }
  }, [localVideoStream, mediaState.audio, recording]);

  const toggleScreenShare = useCallback(async () => {
    if (mediaState.screenShare) {
      if (localScreenStream) {
        localScreenStream.getTracks().forEach((track) => track.stop());
        setLocalScreenStream(null);
      }
      setMediaState((prev) => ({ ...prev, screenShare: false }));
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setLocalScreenStream(stream);
        setMediaState((prev) => ({ ...prev, screenShare: true }));

        stream.getVideoTracks()[0].onended = () => {
          setLocalScreenStream(null);
          setMediaState((prev) => ({ ...prev, screenShare: false }));
        };
      } catch (error) {
        console.error("Failed to start screen sharing:", error);
      }
    }
  }, [mediaState.screenShare, localScreenStream]);

  const endSession = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);

    if (localVideoStream) {
      localVideoStream.getTracks().forEach((track) => track.stop());
      setLocalVideoStream(null);
    }

    if (localScreenStream) {
      localScreenStream.getTracks().forEach((track) => track.stop());
      setLocalScreenStream(null);
    }

    setMediaState({ video: false, audio: false, screenShare: false });
    alert("Session ended");
  }, [localVideoStream, localScreenStream]);

  useEffect(() => {
    initializeVideo();

    return () => {
      if (localVideoStream) {
        localVideoStream.getTracks().forEach((track) => track.stop());
      }
      if (localScreenStream) {
        localScreenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && localVideoStream) {
      videoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  useEffect(() => {
    if (screenRef.current && localScreenStream) {
      screenRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  useEffect(() => {
    if (!socket) return;

    socket.on("transcription", (data) => {
      console.log(data)
    })
  }, [socket])

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
                    muted
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
                  muted
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
        <div>
          {transcript && (
            <p className="text-muted-foreground text-sm">
              Transcription: {transcript}
            </p>
          )}
        </div>
      </section>
      <section className="bg-primary/3 md:p-4 p-2 grid grid-cols-1 md:grid-cols-2 rounded-xl">
        <ActionButtons
          mediaState={mediaState}
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
          toggleScreenShare={toggleScreenShare}
          endSession={endSession}
        />
        <Transcript />
      </section>
    </Container>
  );
};

export default InterviewSessionPage;
