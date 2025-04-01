import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const mapContainerStyle = {
  width: "100%",
  maxWidth: "600px",
  aspectRatio: "16/9",
  height: "auto",
  margin: "0 auto",
};

interface IMapProps {
  coordinates: [number, number] | null;
  zoom?: number;
}

const Map: React.FC<IMapProps> = ({ coordinates, zoom = 15 }) => {
  if (!coordinates) {
    return <div></div>;
  }
  return (
    <MapContainer
      center={coordinates}
      zoom={zoom}
      style={mapContainerStyle}
      dragging={false} // Bloquea el arrastre del mapa
      scrollWheelZoom={false} // Bloquea zoom con la rueda del ratón
      doubleClickZoom={false} // Bloquea zoom con doble clic
      zoomControl={false} // Oculta el control de zoom
      touchZoom={false} //Zoom con los dedos
    >
      <TileLayer url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
    </MapContainer>
  );
};

export default Map;
