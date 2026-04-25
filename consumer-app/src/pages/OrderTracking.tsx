import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../config/supabase';
import api from '../services/api';
import "../styles/orderTracking.css"

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

interface Order {
  id: string;
  status: string;
  destination: { coordinates: [number, number] } | null;
  delivery_position: { coordinates: [number, number] } | null;
}

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryPosition, setDeliveryPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [arrived, setArrived] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);

        if (response.data.delivery_position) {
          const [lng, lat] = response.data.delivery_position.coordinates;
          setDeliveryPosition({ lat, lng });
        }
      } catch {
        setError('Error fetching order');
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Suscribirse al canal de Supabase Broadcast
    const channel = supabase.channel(`order:${id}`);

    channel.on('broadcast', { event: 'position-update' }, (payload) => {
      setDeliveryPosition(payload.payload);
    });

    channel.on('broadcast', { event: 'order-delivered' }, () => {
      setArrived(true);
      setOrder((prev) => prev ? { ...prev, status: 'Entregado' } : prev);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const destination = order?.destination
    ? { lat: order.destination.coordinates[1], lng: order.destination.coordinates[0] }
    : null;

  return (
    <div className="tracking-container">
      <div className="tracking-content">
        <div className="tracking-header">
          <h1 className="tracking-title">Order Tracking</h1>
          <button className="tracking-back" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>

        {error && <p className="tracking-error">{error}</p>}

        {arrived && (
          <div className="tracking-arrived">
            🎉 Your order has been delivered!
          </div>
        )}

        {order && (
          <div className="tracking-status">
            Status: <span className={`status-badge status-${order.status.replace(' ', '_')}`}>
              {order.status}
            </span>
          </div>
        )}

        {destination && (
          <div className="tracking-map">
            <MapContainer
              center={[destination.lat, destination.lng]}
              zoom={16}
              style={{ height: '450px', width: '100%', borderRadius: '12px' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                <Popup>📍 Delivery destination</Popup>
              </Marker>

              {deliveryPosition && (
                <Marker position={[deliveryPosition.lat, deliveryPosition.lng]} icon={deliveryIcon}>
                  <Popup>🛵 Delivery person</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

        {!deliveryPosition && order?.status === 'Creado' && (
          <p className="tracking-waiting">⏳ Waiting for a delivery person to accept your order...</p>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;