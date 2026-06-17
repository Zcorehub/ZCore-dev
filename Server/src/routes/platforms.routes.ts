import { Router } from "express";
import { registerPlatform } from "../controllers/platforms.controller";
import { validate } from "../middleware/validation.middleware";
import { PlatformRegisterSchema } from "../middleware/schemas";

const router = Router();

router.post("/register", validate(PlatformRegisterSchema), registerPlatform);

export default router;
