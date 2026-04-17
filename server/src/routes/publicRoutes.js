import { Router } from "express";
import { getPublicConfig } from "../controllers/publicController.js";

const router = Router();

router.get("/config", getPublicConfig);

export default router;
