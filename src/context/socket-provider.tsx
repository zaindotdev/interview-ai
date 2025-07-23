import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  transcript: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  transcript: "",
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");

  useEffect(() => {
    const ioInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",{
        path:"/api/socket",
        addTrailingSlash:false
    });

    ioInstance.on("connect", () => {
      console.log("Socket connected:", ioInstance.id);
      setIsConnected(true);
    });

    ioInstance.on("transcription", (data) => {
      console.log("Received transcription:", data);
      setTranscript(data);
    });

    ioInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    ioInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });


    setSocket(ioInstance);

    return () => {
      ioInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected,transcript }}>
      {children}
    </SocketContext.Provider>
  );
};
