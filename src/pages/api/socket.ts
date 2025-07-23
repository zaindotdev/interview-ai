import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import { Socket as NetSocket } from "net";

import { AssemblyAI } from "assemblyai";

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}
export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY!, // Replace with your chosen API key, this is the "default" account api key
});

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  console.log(
    "---------------------------------------------------------------------------------------------------------------------------------------"
  );
  console.log("Intailizing Socket");
  const io = new IOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  io.on("connection", async (socket) => {
    const clientId = socket.id;
    console.log("A user connected", clientId);

    const transcriber = client.streaming.transcriber({
      sampleRate: 16_000,
      formatTurns: true,
    });

    transcriber.on("open", ({ id }) => {
      console.log(`Session opened with ID:${id}`);
    });

    transcriber.on("error", (error) => {
      console.error("Error:", error);
    });

    transcriber.on("close", (code, reason) =>
      console.log("Session closed:", code, reason)
    );

    transcriber.on("turn", (turn) => {
      if (!turn.transcript) return;
      // Emit transcript to client
      socket.emit("transcription", turn.transcript);
    });

    await transcriber.connect();

    socket.on("audio-chunk", async (chunk) => {
      try {
        await transcriber.sendAudio(chunk);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected", clientId);
      await transcriber.close();
    });
  });

  (global as any).io = io;
  res.socket.server.io = io;

  res.end();
};

export default handler;
