import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import storyRoutes from './routes/story.routes';
import branchRoutes from './routes/branch.routes';
import commitRoutes from './routes/commit.routes';
import forkRoutes from './routes/fork.routes';
import collaborateRoutes from './routes/collaborate.routes';
import publishRoutes from './routes/publish.routes';
import ratingRoutes from './routes/rating.routes';
import aiRoutes from './routes/ai.routes';
import exportRoutes from './routes/export.routes';

//middlewares
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Global Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://plotforge-seven.vercel.app',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PlotForge API is running 🚀' });
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/stories',storyRoutes);
app.use('/api/stories/:storyId/branches', branchRoutes);
app.use('/api/stories/:storyId/branches/:branchId/commits', commitRoutes);
app.use('/api/stories', forkRoutes);
app.use('/api/forks', forkRoutes);

app.use("/api/stories", collaborateRoutes);
app.use("/api/collaborations", collaborateRoutes);

app.use('/api/stories',publishRoutes);
app.use('/api',publishRoutes);

app.use('/api/endings',ratingRoutes);

app.use('/api/ai',aiRoutes);

app.use('/api/stories', exportRoutes);

// error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PlotForge server running on port ${PORT}`);
});

export default app;