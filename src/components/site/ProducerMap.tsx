import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function ProducerMap({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) {
  return (
    <div role="region" aria-label={`Карта: ${name}`} className="relative z-0 mt-6 h-80 overflow-hidden rounded-xl border border-border">
      <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={[latitude, longitude]} radius={9} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2f6b45", fillOpacity: 1 }}>
          <Popup>{name}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
