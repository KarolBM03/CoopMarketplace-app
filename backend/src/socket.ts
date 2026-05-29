import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`Usuario ${userId} unido a su room`);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io no inicializado");
  }

  return io;
};
