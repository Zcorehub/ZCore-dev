import { Router } from "express";
import { getContractsConfig } from "../controllers/contracts.controller";

const router = Router();

router.get("/config", getContractsConfig);

export default router;
