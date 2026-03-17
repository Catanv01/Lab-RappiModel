import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/products.css';

interface Product {
  id: string;
  name: string;
  price: number;
  storeId: string;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeResponse = await api.get('/stores/my-store');
        setStoreId(storeResponse.data.id);
        const productsResponse = await api.get(`/products/${storeResponse.data.id}`);
        setProducts(productsResponse.data);
      } catch {
        setError('Error fetching data');
      }
    };
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!storeId) return;
    try {
      const response = await api.post('/products', {
        name,
        price: Number(price),
        storeId,
      });
      setProducts([...products, response.data]);
      setName('');
      setPrice('');
    } catch {
      setError('Error creating product');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
    } catch {
      setError('Error deleting product');
    }
  };

  return (
    <div className="products-container">
      <div className="products-content">
        <div className="products-header">
          <h1 className="products-title">Products</h1>
          <button className="products-back" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {error && <p className="products-error">{error}</p>}

        <div className="products-form">
          <h2 className="products-form-title">Add Product</h2>
          <div className="products-field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="products-field">
            <label>Price</label>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <button className="products-add-button" onClick={handleCreateProduct}>
            Add Product
          </button>
        </div>

        <div>
          <h2 className="products-list-title">My Products</h2>
          {products.length === 0 && <p className="products-empty">No products yet</p>}
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div>
                <p className="product-name">{product.name}</p>
                <p className="product-price">${product.price}</p>
              </div>
              <button className="product-delete" onClick={() => handleDelete(product.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;