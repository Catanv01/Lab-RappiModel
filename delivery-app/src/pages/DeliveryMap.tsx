import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../config/supabase';
import api from '../service/api';
import '../styles/deliveryMap.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const STEP = 0.00005;

interface Position {
  lat: number;
  lng: number;
}

interface Order {
  id: string;
  status: string;
  destination: { coordinates: [number, number] } | null;
}

const DeliveryMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [position, setPosition] = useState<Position>({ lat: 3.451, lng: -76.532 });
  const [delivered, setDelivered] = useState(false);
  const [error, setError] = useState('');

  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPosition = useRef<Position>({ lat: 3.451, lng: -76.532 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch {
        setError('Error fetching order');
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`order:${id}`);
    channelRef.current = channel;
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const updatePosition = useCallback(async (pos: Position) => {
    try {

      const response = await api.patch(`/orders/${id}/position`, {
        lat: pos.lat,
        lng: pos.lng,
      });

      channelRef.current?.send({
        type: 'broadcast',
        event: 'position-update',
        payload: pos,
      });

      if (response.data.status === 'delivered') {
        setDelivered(true);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'order-delivered',
          payload: {},
        });
      }
    } catch {
      setError('Error updating position');
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if(delivered) return;
      // Prevenir scroll de la página con las flechas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const current = pendingPosition.current;
      let lat = current.lat;
      let lng = current.lng;

      switch (e.key) {
        case 'ArrowUp':    lat += STEP; break;
        case 'ArrowDown':  lat -= STEP; break;
        case 'ArrowLeft':  lng -= STEP; break;
        case 'ArrowRight': lng += STEP; break;
        default: return;
      }

      const newPos = { lat, lng };

      // Actualizar marcador inmediatamente
      setPosition(newPos);
      pendingPosition.current = newPos;

      // Throttle: llamar API máximo una vez por segundo
      if (throttleRef.current) return;

      throttleRef.current = setTimeout(() => {
        updatePosition(pendingPosition.current);
        throttleRef.current = null;
      }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [updatePosition]);

  const destination = order?.destination
    ? { lat: order.destination.coordinates[1], lng: order.destination.coordinates[0] }
    : null;

  return (
    <div className="deliverymap-container">
      <div className="deliverymap-content">
        <div className="deliverymap-header">
          <h1 className="deliverymap-title">Delivery Map</h1>
          <button className="deliverymap-back" onClick={() => navigate('/my-orders')}>
            Back
          </button>
        </div>

        {error && <p className="deliverymap-error">{error}</p>}

        {delivered && (
          <div className="deliverymap-delivered">
            🎉 Order delivered successfully!
          </div>
        )}

        <div className="deliverymap-hint">
          Use arrow keys ⬆️⬇️⬅️➡️ to move on the map
        </div>

        <div className="deliverymap-map">
          <MapContainer
            keyboard={!delivered}
            center={[position.lat, position.lng]}
            zoom={16}
            style={{ height: '500px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={[position.lat, position.lng]} icon={deliveryIcon}>
              <Popup>🛵 You are here</Popup>
            </Marker>

            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                <Popup>📍 Delivery destination</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;