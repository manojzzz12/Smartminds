import { Router } from "express";
import authRoutes from "./authRoutes.js";
import notebookRoutes from "./notebookRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import chatRoutes from "./chatRoutes.js";
import adminRoutes from "./adminRoutes.js";
import publicRoutes from "./publicRoutes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/notebooks", authenticate, notebookRoutes);
router.use("/uploads", authenticate, uploadRoutes);
router.use("/chat", authenticate, chatRoutes);
router.use("/admin", authenticate, adminRoutes);

export default router;
