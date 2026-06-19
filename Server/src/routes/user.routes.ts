import { Router } from "express";
import { lenderScoreRateLimit } from "../middleware/rate-limit.middleware";
import {
  getProfile,
  getScore,
  getCreditHistory,
  requestScoring,
} from "../controllers/user.controller";
import {
  attestScore,
  getOnChainScore,
} from "../controllers/contracts.controller";
import { validate, validateParams } from "../middleware/validation.middleware";
import { validateLenderKey } from "../middleware/lender-auth.middleware";
import {
  ScoringRequestSchema,
  SignedAuthSchema,
  WalletParamSchema,
} from "../middleware/schemas";

const router = Router();

router.use("/:wallet/score", lenderScoreRateLimit);
router.post("/request", validate(ScoringRequestSchema), requestScoring);
router.get("/:wallet/on-chain", validateParams(WalletParamSchema), getOnChainScore);
router.post(
  "/:wallet/attest",
  validateParams(WalletParamSchema),
  validate(SignedAuthSchema),
  attestScore
);
router.get("/:wallet/score", validateLenderKey, validateParams(WalletParamSchema), getScore);
router.get("/:wallet/history", validateParams(WalletParamSchema), getCreditHistory);
router.get("/:wallet/profile", validateParams(WalletParamSchema), getProfile);

export default router;
