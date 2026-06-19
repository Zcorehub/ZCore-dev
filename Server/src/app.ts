import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { metricsMiddleware } from "./middleware/metrics.middleware";
import { swaggerSpec } from "./config/swagger";
import { healthCheck, livenessCheck, readinessCheck } from "./controllers/health.controller";
import { metricsHandler } from "./controllers/metrics.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", healthCheck);
app.get("/health/live", livenessCheck);
app.get("/health/ready", readinessCheck);
app.get("/metrics", metricsHandler);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api", metricsMiddleware, routes);
app.use(errorHandler);

export default app;
