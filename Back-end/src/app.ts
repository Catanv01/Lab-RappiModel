import express from 'express';
import { NODE_ENV, PORT } from './config';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as storeRouter } from './features/stores/store.router';
import { router as productRouter } from './features/products/product.router';
import { router as orderRouter } from './features/orders/order.router';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World!!!!!');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Error handling middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
  });
}

export default app;