import { Server } from "socket.io";
import prisma from "../database/prisma";

let io: Server;

const canViewShipment = async ({
  shipmentId,
  userId,
  role,
}: {
  shipmentId: string;
  userId?: string;
  role?: string;
}) => {
  if (!userId) return false;
  if (role === "ADMIN") return true;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  return Boolean(
    shipment &&
      (shipment.sellerId === userId || shipment.customerId === userId),
  );
};

const canShareShipmentLocation = async ({
  shipmentId,
  userId,
  role,
}: {
  shipmentId: string;
  userId?: string;
  role?: string;
}) => {
  if (!userId) return false;
  if (role === "ADMIN") return true;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  return Boolean(shipment && shipment.sellerId === userId);
};

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

    socket.on("shipment:join", async ({ shipmentId, userId, role }) => {
      if (!(await canViewShipment({ shipmentId, userId, role }))) {
        socket.emit("shipment:error", {
          shipmentId,
          message: "No tienes permiso para ver este envio",
        });
        return;
      }

      socket.join(`shipment:${shipmentId}`);
    });

    socket.on("shipment:start", async ({ shipmentId, userId, role }) => {
      if (!(await canShareShipmentLocation({ shipmentId, userId, role }))) {
        socket.emit("shipment:error", {
          shipmentId,
          message: "No tienes permiso para iniciar GPS",
        });
        return;
      }

      await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          isTracking: true,
          trackingStartedAt: new Date(),
        },
      });

      io.to(`shipment:${shipmentId}`).emit("shipment:tracking:started", {
        shipmentId,
      });
    });

    socket.on("shipment:location:update", async ({ shipmentId, lat, lng, userId, role }) => {
      if (!(await canShareShipmentLocation({ shipmentId, userId, role }))) {
        socket.emit("shipment:error", {
          shipmentId,
          message: "No tienes permiso para compartir ubicacion",
        });
        return;
      }

      const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          currentLatitude: Number(lat),
          currentLongitude: Number(lng),
          lastLocationAt: new Date(),
          isTracking: true,
        },
      });

      io.to(`shipment:${shipmentId}`).emit("shipment:location:changed", {
        shipmentId,
        lat: shipment.currentLatitude,
        lng: shipment.currentLongitude,
        lastLocationAt: shipment.lastLocationAt,
      });
    });

    socket.on("shipment:stop", async ({ shipmentId, userId, role }) => {
      if (!(await canShareShipmentLocation({ shipmentId, userId, role }))) {
        socket.emit("shipment:error", {
          shipmentId,
          message: "No tienes permiso para detener GPS",
        });
        return;
      }

      await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          isTracking: false,
          trackingEndedAt: new Date(),
        },
      });

      io.to(`shipment:${shipmentId}`).emit("shipment:tracking:stopped", {
        shipmentId,
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

    socket.on("chat:stop_typing", ({ conversationId, userId }) => {
      socket.to(`chat:${conversationId}`).emit("chat:stop_typing", {
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



