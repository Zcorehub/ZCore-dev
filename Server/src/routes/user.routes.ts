import { Router } from "express";
import {
  getProfile,
  getScore,
  getCreditHistory,
  getUserBreakdown,
  requestScoring,
} from "../controllers/user.controller";
import {
  attestScore,
  getOnChainScore,
} from "../controllers/contracts.controller";
import { validate, validateParams } from "../middleware/validation.middleware";
import { validateLenderKey } from "../middleware/lender-auth.middleware";
import { requireWalletSession } from "../middleware/session.middleware";
import {
  ScoringRequestSchema,
  SignedAuthSchema,
  WalletParamSchema,
} from "../middleware/schemas";

const router = Router();

router.post("/request", validate(ScoringRequestSchema), requestScoring);
router.get("/:wallet/on-chain", validateParams(WalletParamSchema), getOnChainScore);
router.post(
  "/:wallet/attest",
  validateParams(WalletParamSchema),
  requireWalletSession,
  validate(SignedAuthSchema),
  attestScore
);
router.get("/:wallet/score", validateLenderKey, validateParams(WalletParamSchema), getScore);
router.get(
  "/:wallet/breakdown",
  validateParams(WalletParamSchema),
  requireWalletSession,
  getUserBreakdown
);
router.get(
  "/:wallet/history",
  validateParams(WalletParamSchema),
  requireWalletSession,
  getCreditHistory
);
router.get(
  "/:wallet/profile",
  validateParams(WalletParamSchema),
  requireWalletSession,
  getProfile
);

export default router;
