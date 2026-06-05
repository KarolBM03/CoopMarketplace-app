import { Server, Socket } from "socket.io";
import prisma from "../database/prisma";

export const registerShipmentSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("shipment:join", (shipmentId: string) => {
      socket.join(`shipment:${shipmentId}`);
    });

    socket.on("shipment:start", async ({ shipmentId }) => {
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

    socket.on("shipment:location:update", async ({ shipmentId, lat, lng }) => {
      const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          currentLatitude: lat,
          currentLongitude: lng,
          lastLocationAt: new Date(),
        },
      });

      io.to(`shipment:${shipmentId}`).emit("shipment:location:changed", {
        shipmentId,
        lat: shipment.currentLatitude,
        lng: shipment.currentLongitude,
        lastLocationAt: shipment.lastLocationAt,
      });
    });

    socket.on("shipment:stop", async ({ shipmentId }) => {
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
  });
};



