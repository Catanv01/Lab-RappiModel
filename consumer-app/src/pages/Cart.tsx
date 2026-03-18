import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, storeId, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!storeId || !user) return;
    try {
      await api.post('/orders', {
        storeId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
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
          <div className="cart-summary">
            <p className="cart-total">Total: ${total}</p>
            <button className="cart-checkout-button" onClick={handleCheckout}>
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;