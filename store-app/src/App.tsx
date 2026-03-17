import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';

const App = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas — solo si hay token */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
      <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;