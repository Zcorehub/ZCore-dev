import { Router } from "express";
import {
  listLenders,
  listPlatforms,
  listRecentEvents,
} from "../controllers/admin.controller";
import { requireAdminKey } from "../middleware/admin-auth.middleware";
import { validateQuery } from "../middleware/validation.middleware";
import { PaginationQuerySchema } from "../middleware/schemas";

const router = Router();

router.use(requireAdminKey);

router.get("/platforms", listPlatforms);
router.get("/lenders", listLenders);
router.get(
  "/events/recent",
  validateQuery(PaginationQuerySchema),
  listRecentEvents
);

export default router;
