import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView: React.FC = () => {
  // Center on Pune, India as default
  const center = [18.5204, 73.8567];

  useEffect(() => {
    // fix leaflet marker icon issues when using bundlers
    // dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      delete (L as any).Icon.Default.prototype._getIconUrl;
      (L as any).Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });
    });
  }, []);

  return (
    <div className="w-full h-96 rounded-lg shadow-md overflow-hidden">
      <MapContainer center={center as any} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center as any}>
          <Popup>Default center (Pune)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;