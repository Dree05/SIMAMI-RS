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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti mobile app atau curl)
    if (!origin) return callback(null, true);
    
    // Izinkan localhost, netlify.app, vercel.app secara dinamis
    const isAllowedPattern = 
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /\.netlify\.app$/.test(origin) ||
      /\.vercel\.app$/.test(origin);
      
    if (isAllowedPattern) {
      return callback(null, true);
    }
    
    // Cek kecocokan dengan daftar CORS_ORIGIN
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*") || allowedOrigins.length === 0) {
      return callback(null, true);
    }
    
    return callback(new Error("Blocked by CORS"), false);
  },
  credentials: true
}));

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
