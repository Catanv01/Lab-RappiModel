import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/cart.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DestinationMarkerProps {
  onSelect: (lat: number, lng: number) => void;
}

const DestinationMarker = ({ onSelect }: DestinationMarkerProps) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, storeId, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

  const handleCheckout = async () => {
    if (!storeId || !user) return;
    if (!destination) {
      setError('Please select a delivery location on the map');
      return;
    }
    try {
      await api.post('/orders', {
        storeId,
        destination,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      alert('Order placed successfully! 🎉');
      navigate('/orders');
    } catch {
      setError('Error creating order');
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-header">
          <h1 className="cart-title">Cart</h1>
          <button className="cart-back" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        {error && <p className="cart-error">{error}</p>}

        {items.length === 0 && <p className="cart-empty">Your cart is empty</p>}

        {items.map((item) => (
          <div key={item.productId} className="cart-item">
            <div>
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-detail">
                ${item.price} x {item.quantity} = ${item.price * item.quantity}
              </p>
            </div>
            <button
              className="cart-item-remove"
              onClick={() => removeItem(item.productId)}
            >
              Remove
            </button>
          </div>
        ))}

        {items.length > 0 && (
          <>
            <div className="cart-summary">
              <p className="cart-total">Total: ${total}</p>
            </div>

            <div className="cart-map-section">
              <h3 className="cart-map-title">
                📍 Select delivery location
              </h3>
              <p className="cart-map-hint">Click on the map to set your delivery point</p>
              {destination && (
                <p className="cart-map-selected">
                  ✅ Location selected: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </p>
              )}
              <div className="cart-map">
                <MapContainer
                  center={[3.451, -76.532]}
                  zoom={15}
                  style={{ height: '300px', width: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DestinationMarker onSelect={(lat, lng) => setDestination({ lat, lng })} />
                  {destination && (
                    <Marker position={[destination.lat, destination.lng]} />
                  )}
                </MapContainer>
              </div>
            </div>

            <button className="cart-checkout-button" onClick={handleCheckout}>
              Place Order
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;