import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { LoginSchema, RegisterSchema } from "../middleware/schemas";

const router = Router();

router.post("/register", validate(RegisterSchema), registerUser);
router.post("/login", validate(LoginSchema), loginUser);

export default router;
