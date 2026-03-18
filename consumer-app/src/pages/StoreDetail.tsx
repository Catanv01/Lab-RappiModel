import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import '../styles/StoreDetail.css';

interface Product {
  id: string;
  name: string;
  price: number;
  storeId: string;
}

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
}

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, total } = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storesResponse = await api.get('/stores');
        const foundStore = storesResponse.data.find((s: Store) => s.id === id);
        setStore(foundStore);
        const productsResponse = await api.get(`/products/${id}`);
        setProducts(productsResponse.data);
      } catch {
        setError('Error fetching store details');
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = (product: Product) => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      },
      product.storeId
    );
  };

  return (
    <div className="storedetail-container">
      <div className="storedetail-content">
        <div className="storedetail-header">
          <h1 className="storedetail-title">{store?.name}</h1>
          <button className="storedetail-back" onClick={() => navigate('/stores')}>
            Back
          </button>
        </div>

        <p className="storedetail-status">
          {store?.isOpen ? '🟢 Open' : '🔴 Closed'}
        </p>

        {error && <p className="storedetail-error">{error}</p>}

        {products.length === 0 && <p className="storedetail-empty">No products available</p>}

        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div>
              <p className="product-info-name">{product.name}</p>
              <p className="product-info-price">${product.price}</p>
            </div>
            <button
              className="product-add-button"
              onClick={() => handleAddToCart(product)}
            >
              Add
            </button>
          </div>
        ))}

        {items.length > 0 && (
          <div className="storedetail-cart-bar">
            <p className="storedetail-cart-info">
              {items.length} items — ${total}
            </p>
            <button
              className="storedetail-cart-button"
              onClick={() => navigate('/cart')}
            >
              View Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;