import { Router } from "express";
import {
  createNotebook,
  deleteNotebook,
  getNotebookDetails,
  listNotebooks,
  updateNotebook
} from "../controllers/notebookController.js";

const router = Router();

router.get("/", listNotebooks);
router.post("/", createNotebook);
router.get("/:id", getNotebookDetails);
router.patch("/:id", updateNotebook);
router.delete("/:id", deleteNotebook);

export default router;
