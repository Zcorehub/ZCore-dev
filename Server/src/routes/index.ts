import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import lenderRoutes from "./lender.routes";
import paymentRoutes from "./payment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/lender", lenderRoutes);
router.use("/payment", paymentRoutes);

export default router;
