import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TraceLoom backend listening on port ${port}`);
});

