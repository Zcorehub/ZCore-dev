import { Router } from "express";
import { defineProfiles } from "../controllers/lender.controller";
import { validate } from "../middleware/validation.middleware";
import { ProfileDefinitionSchema } from "../middleware/schemas";

const router = Router();

router.post("/profiles", validate(ProfileDefinitionSchema), defineProfiles);

export default router;
