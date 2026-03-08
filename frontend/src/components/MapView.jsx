import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const priorityColor = (score) => {
  if (score >= 0.75) return "red";
  if (score >= 0.5) return "orange";
  if (score >= 0.3) return "yellow";
  return "green";
};

export default function MapView({ villages = [], ambulances = [], disasters = [] }) {
  const center = villages[0]?.location?.coordinates
    ? [villages[0].location.coordinates[1], villages[0].location.coordinates[0]]
    : [13.0, 77.5];

  return (
    <div className="h-[480px] rounded-xl overflow-hidden border border-slate-800">
      <MapContainer center={center} zoom={9} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {villages.map((v) => {
          const [lng, lat] = v.location.coordinates;
          const score = v.priorityScore ?? 0.2;
          const color = priorityColor(score);
          return (
            <Circle
              key={v._id}
              center={[lat, lng]}
              radius={2000}
              pathOptions={{ color, fillOpacity: 0.4 }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{v.name}</div>
                  <div>Priority: {score.toFixed(2)}</div>
                  <div>Population: {v.population}</div>
                  <div>Elderly: {v.elderlyPopulation}</div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {ambulances.map((a) => {
          const [lng, lat] = a.location.coordinates;
          return (
            <Marker key={a._id} position={[lat, lng]}>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{a.vehicleNumber}</div>
                  <div>Status: {a.status}</div>
                  <div>Driver: {a.driverName}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {disasters.map((d) => {
          const [lng, lat] = d.location.coordinates;
          return (
            <Circle
              key={d._id}
              center={[lat, lng]}
              radius={5000}
              pathOptions={{ color: "purple", fillOpacity: 0.25 }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">Disaster: {d.type}</div>
                  <div>Severity: {d.severity}</div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}

