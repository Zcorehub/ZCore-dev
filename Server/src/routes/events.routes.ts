import { Router } from "express";
import { reportCreditEvent } from "../controllers/events.controller";
import { validate } from "../middleware/validation.middleware";
import { CreditEventSchema } from "../middleware/schemas";
import { eventReportRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/report",
  eventReportRateLimit,
  validate(CreditEventSchema),
  reportCreditEvent
);

export default router;
