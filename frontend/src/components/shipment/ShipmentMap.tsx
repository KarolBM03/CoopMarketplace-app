import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type ShipmentMapProps = {
  lat: number;
  lng: number;
};

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

        <Marker position={[lat, lng]}>
          <Popup>Tu paquete va por aquí</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
