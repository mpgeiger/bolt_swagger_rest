import express from 'express';
import cors from 'cors';
import { swaggerBoltRouter } from './routes/swagger-bolt';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', swaggerBoltRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'swagger-bolt' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});