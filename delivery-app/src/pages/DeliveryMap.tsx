import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../config/supabase';
import api from '../service/api';
import '../styles/DeliveryMap.css';

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
  const pendingPosition = useRef(position);
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

  const updatePosition = async (pos: Position) => {
    try {
      const response = await api.patch(`/orders/${id}/position`, {
        lat: pos.lat,
        lng: pos.lng,
      });

      // Emitir posición via Supabase Broadcast
      channelRef.current?.send({
        type: 'broadcast',
        event: 'position-update',
        payload: pos,
      });

      // Si el backend detectó que llegó al destino
      if (response.data.status === 'Entregado') {
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
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let { lat, lng } = position;

      switch (e.key) {
        case 'ArrowUp':    lat += STEP; break;
        case 'ArrowDown':  lat -= STEP; break;
        case 'ArrowLeft':  lng -= STEP; break;
        case 'ArrowRight': lng += STEP; break;
        default: return;
      }

      // Mover marcador inmediatamente
      setPosition({ lat, lng });
      pendingPosition.current = { lat, lng };

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
  }, [position]);

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