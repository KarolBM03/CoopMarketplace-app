import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type ShipmentMapProps = {
  lat: number;
  lng: number;
};

function LiveMapCenter({ lat, lng }: ShipmentMapProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), {
      animate: true,
      duration: 0.8,
    });
  }, [lat, lng, map]);

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);

  return null;
}

export default function ShipmentMap({ lat, lng }: ShipmentMapProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-72 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LiveMapCenter lat={lat} lng={lng} />
        <Marker position={[lat, lng]}>
          <Popup>Tu paquete va por aqui</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
