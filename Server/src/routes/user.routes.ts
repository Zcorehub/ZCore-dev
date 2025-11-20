import { Router } from "express";
import { getProfile, requestScoring } from "../controllers/user.controller";
import { validate } from "../middleware/validation.middleware";
import { ScoringRequestSchema } from "../middleware/schemas";

const router = Router();

router.post("/request", validate(ScoringRequestSchema), requestScoring);
router.get("/:wallet/profile", getProfile);

export default router;
