import { Router } from "express";
import { uploadSource } from "../controllers/uploadController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", upload.single("file"), uploadSource);

export default router;
