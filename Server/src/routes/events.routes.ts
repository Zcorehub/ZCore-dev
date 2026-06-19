import { Router } from "express";
import { reportCreditEvent } from "../controllers/events.controller";
import { validate } from "../middleware/validation.middleware";
import {
  createRateLimiter,
  bodyApiKey,
} from "../middleware/rate-limit.middleware";
import { CreditEventSchema } from "../middleware/schemas";

const router = Router();

const eventReportRateLimit = createRateLimiter({
  name: "events_report",
  limit: 100,
  windowSec: 60,
  keyGenerator: bodyApiKey,
});

router.post(
  "/report",
  eventReportRateLimit,
  validate(CreditEventSchema),
  reportCreditEvent
);

export default router;
