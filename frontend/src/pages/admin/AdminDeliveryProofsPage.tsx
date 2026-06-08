import { useEffect, useState } from "react";
import { MapPin, PackageCheck } from "lucide-react";
import { getAdminShipmentProofs } from "../../services/shipment.service";

export default function AdminDeliveryProofsPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProofs();
  }, []);

  const loadProofs = async () => {
    try {
      const data = await getAdminShipmentProofs();
      setProofs(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-600">
          Cooperativa
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Evidencias de entrega
        </h1>
      </div>

      {loading ? (
        <div>Cargando evidencias...</div>
      ) : (
        <div className="grid gap-6">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <PackageCheck className="h-6 w-6 text-emerald-600" />

                <h2 className="text-xl font-black">{proof.product?.title}</h2>
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <p>
                  <strong>Cliente:</strong> {proof.customer?.fullName}
                </p>

                <p>
                  <strong>Vendedor:</strong> {proof.seller?.fullName}
                </p>

                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(proof.deliveredAt).toLocaleString()}
                </p>

                <p>
                  <strong>Notas:</strong> {proof.notes || "Sin notas"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />

                <span>
                  {proof.latitude}, {proof.longitude}
                </span>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${proof.latitude},${proof.longitude}`,
                      "_blank",
                    )
                  }
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-black text-white hover:bg-blue-500"
                >
                  Ver mapa
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-black">Cliente con el producto</p>

                  {proof.customerPhotoUrl ? (
                    <img
                      src={proof.customerPhotoUrl}
                      alt=""
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                      Evidencia antigua
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 font-black">Producto solo</p>

                  {proof.productPhotoUrl ? (
                    <img
                      src={proof.productPhotoUrl}
                      alt=""
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                      Evidencia antigua
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
