import { Router } from "express";
import { getAdminOverview, updateAdminConfig } from "../controllers/adminController.js";
import { authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authorize("admin"), getAdminOverview);
router.put("/", authorize("admin"), updateAdminConfig);

export default router;
