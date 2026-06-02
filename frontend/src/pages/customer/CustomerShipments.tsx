import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<
    Record<string, { lat: number; lng: number }>
  >({});

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    if (!shipments.length) return;

    if (!socket.connected) {
      socket.connect();
    }

    shipments.forEach((shipment) => {
      socket.emit("shipment:join", shipment.id);
    });

    socket.on("shipment:location:changed", (data) => {
      setLocations((prev) => ({
        ...prev,
        [data.shipmentId]: {
          lat: data.lat,
          lng: data.lng,
        },
      }));
    });

    return () => {
      socket.off("shipment:location:changed");
    };
  }, [shipments]);

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
          <p className="mt-2 text-sm font-medium text-slate-500">
            Revisa el estado de tus productos enviados por los vendedores.
          </p>
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

                {locations[shipment.id] && (
                  <ShipmentMap
                    lat={locations[shipment.id].lat}
                    lng={locations[shipment.id].lng}
                  />
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
