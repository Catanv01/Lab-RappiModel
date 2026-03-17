import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/dashboard.css';

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  userId: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get('/stores/my-store');
        setStore(response.data);
      } catch {
        setError('Error fetching store');
      }
    };
    fetchStore();
  }, []);

  const toggleStore = async () => {
    if (!store) return;
    try {
      const response = await api.patch(`/stores/${store.id}`, {
        isOpen: !store.isOpen,
      });
      setStore(response.data);
    } catch {
      setError('Error updating store');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-welcome">Welcome, {user?.email}</p>
          </div>
          <button className="dashboard-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && <p className="dashboard-error">{error}</p>}

        {store && (
          <div className="store-card">
            <h2 className="store-name">{store.name}</h2>
            <p className="store-status">
              Status: <strong>{store.isOpen ? '🟢 Open' : '🔴 Closed'}</strong>
            </p>
            <button
              onClick={toggleStore}
              className={store.isOpen ? 'store-toggle-open' : 'store-toggle-closed'}
            >
              {store.isOpen ? 'Close Store' : 'Open Store'}
            </button>
          </div>
        )}

        <div className="dashboard-nav">
          <Link to="/products" className="dashboard-nav-button">
            🛍️ Manage Products
          </Link>
          <Link to="/orders" className="dashboard-nav-button">
            📦 View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;