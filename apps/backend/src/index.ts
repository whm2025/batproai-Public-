import express from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import pkg from "pg";
const { Pool } = pkg;

import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import projectsRouter from "./routes/projects";
import sitesRouter from "./routes/sites";
import tasksRouter from "./routes/tasks";
import budgetRouter from "./routes/budget";

dotenv.config();
const app = express();

// CORS
const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// ✅ Express 5: utiliser une REGEX au lieu de "*"
app.options(/^\/.*/, cors(corsOptions));

app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/ping", (_req, res) => res.json({ pong: true }));

// Routes
app.use("/auth", authRouter); // public
app.use("/me", meRouter); // JWT
app.use("/projects", projectsRouter); // JWT
app.use("/projects/:projectId/sites", sitesRouter); // JWT
app.use("/projects/:projectId/tasks", tasksRouter); // JWT
app.use("/projects/:projectId/budget", budgetRouter); // JWT

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
