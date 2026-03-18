import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AvailableOrders from './pages/AvailableOrders';
import MyOrders from './pages/MyOrders';

const App = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route path="/available-orders" element={token ? <AvailableOrders /> : <Navigate to="/login" />} />
      <Route path="/my-orders" element={token ? <MyOrders /> : <Navigate to="/login" />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to={token ? "/available-orders" : "/login"} />} />
    </Routes>
  );
};

export default App;