import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import assetRoutes from "./routes/assets.routes.js";
import mutationRoutes from "./routes/mutations.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import userRoutes from "./routes/users.routes.js";
import borrowRoutes from "./routes/borrows.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    service: "SIMAMI-RS API",
    status: "running",
    version: "1.1.0-premium"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/mutations", mutationRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

// Jalankan server lokal hanya jika bukan di environment Vercel
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`SIMAMI-RS API berjalan di http://localhost:${port}`);
  });
}

// Export sebagai Vercel Serverless Function handler
export default app;
