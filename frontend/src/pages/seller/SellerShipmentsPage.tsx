import { CheckCircle2, PackageCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { socket } from "../../socket";
import {
  getSellerShipments,
  updateShipmentStatus,
  type ShipmentStatus,
} from "../../services/shipment.service";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

const nextStatuses: Array<{ status: ShipmentStatus; label: string }> = [
  { status: "PREPARING", label: "Marcar preparando" },
  { status: "SHIPPED", label: "Marcar enviado" },
  { status: "IN_TRANSIT", label: "Marcar en camino" },
  { status: "DELIVERED", label: "Marcar entregado" },
];

const nextStatusByCurrent: Partial<
  Record<ShipmentStatus, { status: ShipmentStatus; label: string }>
> = {
  PENDING_PREPARATION: nextStatuses[0],
  PREPARING: nextStatuses[1],
  SHIPPED: nextStatuses[2],
  IN_TRANSIT: nextStatuses[3],
};

const statusClass: Record<string, string> = {
  PENDING_PREPARATION: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  PREPARING: "bg-blue-50 text-blue-700 ring-blue-200",
  SHIPPED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_TRANSIT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DELIVERED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
};

export default function SellerShipmentsPage() {
  const user = useAuthStore.getState().user;
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [trackingShipmentId, setTrackingShipmentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getSellerShipments();
      setShipments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (shipmentId: string, status: ShipmentStatus) => {
    try {
      setProcessingId(shipmentId);
      await updateShipmentStatus(shipmentId, status);
      toast.success("Estado de envio actualizado");
      await loadShipments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo actualizar");
    } finally {
      setProcessingId(null);
    }
  };

  const startTracking = (shipmentId: string) => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta GPS");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("shipment:join", shipmentId);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit("shipment:location:update", {
          shipmentId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        toast.error("No se pudo obtener tu ubicación");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    setWatchId(id);
    setTrackingShipmentId(shipmentId);
    toast.success("Seguimiento GPS iniciado");
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setWatchId(null);
    setTrackingShipmentId(null);
    toast.success("Seguimiento GPS detenido");
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Envios
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Preparacion y envios
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Truck className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))
        ) : shipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-800">
              No hay envios pendientes
            </h2>
          </div>
        ) : (
          shipments.map((shipment) => {
            const item = shipment.order?.items?.[0];
            const product = item?.product;
            const next = nextStatusByCurrent[shipment.status as ShipmentStatus];

            return (
              <article
                key={shipment.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      product?.imageUrl ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                    }
                    alt={product?.title || "Producto"}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {product?.title || "Orden pagada"}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      Cliente: {shipment.order?.customer?.fullName || "Cliente"}
                    </p>
                    <p className="text-sm text-slate-400">
                      Orden #
                      {String(shipment.orderId).slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-black ring-1 ${
                      statusClass[shipment.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabel(shipment.status)}
                  </span>

                  {shipment.status !== "DELIVERED" && next && (
                    <button
                      onClick={() => handleStatus(shipment.id, next.status)}
                      disabled={processingId === shipment.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <PackageCheck className="h-4 w-4" />
                      {processingId === shipment.id
                        ? "Guardando..."
                        : next.label}
                    </button>
                  )}
                </div>

                {shipment.status === "IN_TRANSIT" &&
                  (trackingShipmentId === shipment.id ? (
                    <button
                      onClick={stopTracking}
                      className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500"
                    >
                      Detener GPS
                    </button>
                  ) : (
                    <button
                      onClick={() => startTracking(shipment.id)}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500"
                    >
                      Iniciar GPS
                    </button>
                  ))}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
