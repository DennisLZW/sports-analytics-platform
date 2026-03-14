import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import leagueRoutes from "./routes/leagues.js";
import matchRoutes from "./routes/matches.js";
import watchlistRoutes from "./routes/watchlist.js";
import predictionRoutes from "./routes/predictions.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "INTERNAL_ERROR" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
