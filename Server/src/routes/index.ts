import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import lenderRoutes from "./lender.routes";
import paymentRoutes from "./payment.routes";
import eventsRoutes from "./events.routes";
import platformsRoutes from "./platforms.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/lender", lenderRoutes);
router.use("/payment", paymentRoutes);
router.use("/events", eventsRoutes);
router.use("/platforms", platformsRoutes);

export default router;
