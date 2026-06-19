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
import {
  authChallengeRateLimit,
  signedAuthRateLimit,
} from "../middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/challenge",
  authChallengeRateLimit,
  validate(ChallengeRequestSchema),
  requestChallenge
);
router.post("/register", validate(RegisterSchema), registerUser);
router.post("/login", validate(LoginSchema), loginUser);
router.post(
  "/register/signed",
  signedAuthRateLimit,
  validate(SignedAuthSchema),
  registerWithSignature
);
router.post(
  "/login/signed",
  signedAuthRateLimit,
  validate(SignedAuthSchema),
  loginWithSignature
);

export default router;
