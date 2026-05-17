import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ForkTale API is running 🚀' });
});

// Routes will come here one by one as we build

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ForkTale server running on port ${PORT}`);
});

export default app;