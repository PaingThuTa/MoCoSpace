import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const defaultData = {
  items: [],
  reviewLog: [],
  settings: {
    darkMode: false,
  },
};

function normalizeData(data = {}) {
  return {
    ...defaultData,
    ...data,
    items: Array.isArray(data.items) ? data.items : defaultData.items,
    reviewLog: Array.isArray(data.reviewLog) ? data.reviewLog : defaultData.reviewLog,
    settings: {
      ...defaultData.settings,
      ...(data.settings || {}),
      darkMode: Boolean(data?.settings?.darkMode),
    },
  };
}

const appDataSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Object, required: true, default: defaultData },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const AppData = mongoose.model('AppData', appDataSchema);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/data', async (_req, res, next) => {
  try {
    const record = await AppData.findOne({ key: 'main' }).lean();
    res.json({ data: normalizeData(record?.data) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/data', async (req, res, next) => {
  try {
    const normalized = normalizeData(req.body);

    await AppData.findOneAndUpdate(
      { key: 'main' },
      { $set: { data: normalized } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ data: normalized });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
