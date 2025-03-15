import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const mapContainerStyle = {
  width: '100%',
  maxWidth: '600px', 
  aspectRatio: '16/9', 
  height: 'auto', 
  margin: '0 auto',
};

const Map = ({ coordinates = [0, 0] }) => {
  if(!coordinates) {
    return (<div></div>)
  }
  return (
    <MapContainer
      center={coordinates}
      zoom={15}
      style={mapContainerStyle}
      dragging={false} // Bloquea el arrastre del mapa
      scrollWheelZoom={false} // Bloquea zoom con la rueda del ratón
      doubleClickZoom={false} // Bloquea zoom con doble clic
      zoomControl={false} // Oculta el control de zoom
    >
      {/* Capa de mapa satelital de Esri */}
      <TileLayer
        url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri, Maxar, Earthstar Geographics"
      />

      {/* Marca la ubicación seleccionada */}
      {coordinates && <Marker position={coordinates} />}
    </MapContainer>
  );
};

export default Map;
