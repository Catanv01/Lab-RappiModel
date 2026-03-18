import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Stores.css';

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
}

const Stores = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/stores');
        setStores(response.data);
      } catch {
        setError('Error fetching stores');
      }
    };
    fetchStores();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="stores-container">
      <div className="stores-content">
        <div className="stores-header">
          <h1 className="stores-title">Stores</h1>
          <div className="stores-actions">
            <button className="stores-orders-button" onClick={() => navigate('/orders')}>
              My Orders
            </button>
            <button className="stores-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="stores-error">{error}</p>}

        {stores.length === 0 && <p className="stores-empty">No stores available</p>}

        {stores.map((store) => (
          <div
            key={store.id}
            className="store-card"
            onClick={() => navigate(`/stores/${store.id}`)}
          >
            <div>
              <p className="store-card-name">{store.name}</p>
              <p className="store-card-status">
                {store.isOpen ? '🟢 Open' : '🔴 Closed'}
              </p>
            </div>
            <span className="store-card-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stores;