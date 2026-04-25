import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AvailableOrders from './pages/AvailableOrders';
import MyOrders from './pages/MyOrders';
import DeliveryMap from './pages/DeliveryMap';

const App = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/available-orders" element={token ? <AvailableOrders /> : <Navigate to="/login" />} />
      <Route path="/my-orders" element={token ? <MyOrders /> : <Navigate to="/login" />} />
      <Route path="/orders/:id/map" element={token ? <DeliveryMap /> : <Navigate to="/login" />} />

      <Route path="*" element={<Navigate to={token ? "/available-orders" : "/login"} />} />
    </Routes>
  );
};

export default App;