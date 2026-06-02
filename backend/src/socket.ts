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

    socket.on("shipment:join", (shipmentId: string) => {
      socket.join(`shipment:${shipmentId}`);
    });

    socket.on("shipment:location:update", ({ shipmentId, lat, lng }) => {
      io.to(`shipment:${shipmentId}`).emit("shipment:location:changed", {
        shipmentId,
        lat,
        lng,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });

    socket.on("chat:join", (conversationId: string) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on("chat:typing", ({ conversationId, userId }) => {
      socket.to(`chat:${conversationId}`).emit("chat:typing", {
        conversationId,
        userId,
      });
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
