import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket.ts";
import ShipmentMap from "../../components/shipment/ShipmentMap";
import { getCustomerShipments } from "../../services/shipment.service";
import { useAuthStore } from "../../store/auth.store";
import { statusLabel } from "../../utils/statusLabels";

const statusClass: Record<string, string> = {
  PENDING_PREPARATION: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  PREPARING: "bg-blue-50 text-blue-700 ring-blue-200",
  SHIPPED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_TRANSIT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DELIVERED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
};

const steps = ["Pendiente", "Preparando", "Enviado", "En camino", "Entregado"];

const stepByStatus: Record<string, number> = {
  PENDING_PREPARATION: 1,
  PREPARING: 2,
  SHIPPED: 3,
  IN_TRANSIT: 4,
  DELIVERED: 5,
};

export default function CustomerShipmentsPage() {
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<
    Record<string, { lat: number; lng: number; lastLocationAt?: string }>
  >({});

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    if (!shipments.length || !user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const initialLocations = shipments.reduce(
      (acc, shipment) => {
        if (
          shipment.currentLatitude !== null &&
          shipment.currentLatitude !== undefined &&
          shipment.currentLongitude !== null &&
          shipment.currentLongitude !== undefined
        ) {
          acc[shipment.id] = {
            lat: Number(shipment.currentLatitude),
            lng: Number(shipment.currentLongitude),
            lastLocationAt: shipment.lastLocationAt,
          };
        }

        return acc;
      },
      {} as Record<
        string,
        { lat: number; lng: number; lastLocationAt?: string }
      >,
    );

    setLocations((prev) => ({
      ...initialLocations,
      ...prev,
    }));

    shipments.forEach((shipment) => {
      socket.emit("shipment:join", {
        shipmentId: shipment.id,
        userId: user.id,
        role: user.role,
      });
    });

    const handleLocationChanged = (data: any) => {
      setLocations((prev) => ({
        ...prev,
        [data.shipmentId]: {
          lat: Number(data.lat),
          lng: Number(data.lng),
          lastLocationAt: data.lastLocationAt,
        },
      }));
    };

    const handleTrackingStopped = (data: any) => {
      setLocations((prev) => {
        const next = { ...prev };
        delete next[data.shipmentId];
        return next;
      });
    };

    const handleShipmentError = (data: any) => {
      console.warn(data.message);
    };

    socket.on("shipment:location:changed", handleLocationChanged);
    socket.on("shipment:tracking:stopped", handleTrackingStopped);
    socket.on("shipment:error", handleShipmentError);

    return () => {
      socket.off("shipment:location:changed", handleLocationChanged);
      socket.off("shipment:tracking:stopped", handleTrackingStopped);
      socket.off("shipment:error", handleShipmentError);
    };
  }, [shipments, user]);

  const loadShipments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCustomerShipments(user.id);
      setShipments(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Envíos
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Mis pedidos
          </h1>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Truck className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))
        ) : shipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-5 text-xl font-black text-slate-800">
              No tienes envíos todavía
            </h2>
          </div>
        ) : (
          shipments.map((shipment) => {
            const item = shipment.order?.items?.[0];
            const product = item?.product;
            const currentStep = stepByStatus[shipment.status] || 1;

            return (
              <article
                key={shipment.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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
                        {product?.title || "Producto"}
                      </h2>
                      <p className="text-sm text-slate-500">
                        Orden #
                        {String(shipment.orderId).slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-black ring-1 ${
                      statusClass[shipment.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabel(shipment.status)}
                  </span>
                </div>

                {shipment.status === "DELIVERED" && product?.id && (
                  <button
                    onClick={() =>
                      navigate(`/products/${product.id}`, {
                        state: {
                          source: "customer",
                        },
                      })
                    }
                    className="mt-3 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400"
                  >
                    Opinar sobre el producto
                  </button>
                )}

                <div className="mt-6 grid gap-2 sm:grid-cols-5">
                  {steps.map((step, index) => {
                    const done = currentStep >= index + 1;

                    return (
                      <div
                        key={step}
                        className={`rounded-xl border p-3 text-xs font-black ${
                          done
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        <div className="mb-2">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {step}
                      </div>
                    );
                  })}
                </div>

                {locations[shipment.id] ? (
                  <>
                    <ShipmentMap
                      lat={locations[shipment.id].lat}
                      lng={locations[shipment.id].lng}
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Ubicacion actualizada en tiempo real
                    </p>
                  </>
                ) : shipment.status === "IN_TRANSIT" ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    Esperando que el vendedor inicie el GPS.
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
