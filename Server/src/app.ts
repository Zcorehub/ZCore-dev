import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { swaggerSpec } from "./config/swagger";
import { healthCheck } from "./controllers/health.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", healthCheck);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api", routes);
app.use(errorHandler);

export default app;
