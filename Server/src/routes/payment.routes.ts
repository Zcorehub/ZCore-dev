import { Router } from "express";
import { reportPayment } from "../controllers/payment.controller";
import { validate } from "../middleware/validation.middleware";
import { PaymentReportSchema } from "../middleware/schemas";

const router = Router();

router.post("/report", validate(PaymentReportSchema), reportPayment);

export default router;
