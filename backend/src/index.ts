import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Minimal health endpoint so the server can be verified to start.
// No business logic or domain endpoints yet.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bookit-backend' });
});

app.listen(PORT, () => {
  console.log(`Bookit backend listening on port ${PORT}`);
});
