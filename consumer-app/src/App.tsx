import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Stores from './pages/Stores';
import StoreDetail from './pages/StoreDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';

const App = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/stores" element={token ? <Stores /> : <Navigate to="/login" />} />
      <Route path="/stores/:id" element={token ? <StoreDetail /> : <Navigate to="/login" />} />
      <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
      <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
      <Route path="/orders/:id/tracking" element={token ? <OrderTracking /> : <Navigate to="/login" />} />

      <Route path="*" element={<Navigate to={token ? "/stores" : "/login"} />} />
    </Routes>
  );
};

export default App;