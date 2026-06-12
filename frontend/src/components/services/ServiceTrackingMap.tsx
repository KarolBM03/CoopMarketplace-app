import { useEffect } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";

type Point = {
  lat: number;
  lng: number;
};

type ServiceTrackingMapProps = {
  providerLocation?: Point;
  origin?: Point;
  destination?: Point;
};

const defaultOrigin = { lat: 18.4861, lng: -69.9312 };
const defaultDestination = { lat: 18.4775, lng: -69.9057 };

function MapUpdater({ location }: { location: Point }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([location.lat, location.lng], map.getZoom(), {
      animate: true,
      duration: 0.8,
    });
  }, [location, map]);

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);

  return null;
}

export default function ServiceTrackingMap({
  providerLocation,
  origin = defaultOrigin,
  destination = defaultDestination,
}: ServiceTrackingMapProps) {
  const liveLocation = providerLocation || {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };
  const route: [number, number][] = [
    [origin.lat, origin.lng],
    [liveLocation.lat, liveLocation.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">Seguimiento GPS</h2>
          <p className="text-sm font-medium text-slate-500">
            Mapa preparado para ubicacion en tiempo real.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
          OpenStreetMap
        </span>
      </div>

      <MapContainer
        center={[liveLocation.lat, liveLocation.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-80 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater location={liveLocation} />
        <Polyline positions={route} pathOptions={{ color: "#059669", weight: 5 }} />
        <Marker position={[origin.lat, origin.lng]}>
          <Popup>Origen</Popup>
        </Marker>
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>Destino</Popup>
        </Marker>
        <Marker position={[liveLocation.lat, liveLocation.lng]}>
          <Popup>Proveedor</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
