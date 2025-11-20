import { Router } from "express";
import { getProfile, requestScoring } from "../controllers/user.controller";
import { validate, validateParams } from "../middleware/validation.middleware";
import { ScoringRequestSchema, WalletParamSchema } from "../middleware/schemas";

const router = Router();

router.post("/request", validate(ScoringRequestSchema), requestScoring);
router.get("/:wallet/profile", validateParams(WalletParamSchema), getProfile);

export default router;
