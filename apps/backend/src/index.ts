import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/ping", (_req, res) => res.json({ pong: true }));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
