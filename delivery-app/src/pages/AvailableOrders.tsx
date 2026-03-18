import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import '../styles/AvailableOrders.css';

interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  status: string;
  createdAt: string;
}

const AvailableOrders = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/available');
        setOrders(response.data);
      } catch {
        setError('Error fetching orders');
      }
    };
    fetchOrders();
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'accepted' });
      setOrders(orders.filter((o) => o.id !== orderId));
    } catch {
      setError('Error accepting order');
    }
  };

  const handleDecline = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'declined' });
      setOrders(orders.filter((o) => o.id !== orderId));
    } catch {
      setError('Error declining order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="available-container">
      <div className="available-content">
        <div className="available-header">
          <h1 className="available-title">Available Orders</h1>
          <div className="available-actions">
            <button className="available-myorders-button" onClick={() => navigate('/my-orders')}>
              My Orders
            </button>
            <button className="available-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="available-error">{error}</p>}

        {orders.length === 0 && <p className="available-empty">No available orders</p>}

        {orders.map((order) => (
          <div key={order.id} className="available-card">
            <p className="available-card-id">ID: {order.id}</p>
            <p className="available-card-date">
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <div className="available-card-actions">
              <button className="available-accept" onClick={() => handleAccept(order.id)}>
                Accept
              </button>
              <button className="available-decline" onClick={() => handleDecline(order.id)}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableOrders;