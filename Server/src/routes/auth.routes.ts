import { Router } from "express";
import {
  loginUser,
  registerUser,
  requestChallenge,
  loginWithSignature,
  registerWithSignature,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import {
  LoginSchema,
  RegisterSchema,
  SignedAuthSchema,
  ChallengeRequestSchema,
} from "../middleware/schemas";

const router = Router();

router.post("/challenge", validate(ChallengeRequestSchema), requestChallenge);
router.post("/register", validate(RegisterSchema), registerUser);
router.post("/login", validate(LoginSchema), loginUser);
router.post("/register/signed", validate(SignedAuthSchema), registerWithSignature);
router.post("/login/signed", validate(SignedAuthSchema), loginWithSignature);

export default router;
