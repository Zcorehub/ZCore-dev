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
  createRateLimiter,
  clientIpKey,
} from "../middleware/rate-limit.middleware";
import {
  LoginSchema,
  RegisterSchema,
  SignedAuthSchema,
  ChallengeRequestSchema,
} from "../middleware/schemas";

const router = Router();

const challengeRateLimit = createRateLimiter({
  name: "auth_challenge",
  limit: 10,
  windowSec: 60,
  keyGenerator: clientIpKey,
});

const signedAuthRateLimit = createRateLimiter({
  name: "auth_signed",
  limit: 5,
  windowSec: 60,
  keyGenerator: clientIpKey,
});

router.post(
  "/challenge",
  challengeRateLimit,
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
