import { Router } from "express";
import { reportCreditEvent } from "../controllers/events.controller";
import { validate } from "../middleware/validation.middleware";
import { CreditEventSchema } from "../middleware/schemas";

const router = Router();

router.post("/report", validate(CreditEventSchema), reportCreditEvent);

export default router;
