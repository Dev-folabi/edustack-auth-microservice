import express from "express";
import {
  createSession,
  updateSession,
  deleteSession,
  getAllSessions,
  getSession,
  getSessionById,
} from "../../controllers/sessionController";
import {
  validateCreateSession,
  validateUpdateSession,
  validateDeleteSession,
} from "../../middlewares/Validators";
import { roleAuthorization } from "../../middlewares/authorization";

const router = express.Router();

router.post(
  "/",
  roleAuthorization(["super_admin"]),
  validateCreateSession,
  createSession
);
router.get("/", getSession);
router.get("/all", getAllSessions);
router.get("/:id", getSessionById);
router.put(
  "/:id",
  roleAuthorization(["super_admin"]),
  validateUpdateSession,
  updateSession
);
router.delete(
  "/:id",
  roleAuthorization(["super_admin"]),
  validateDeleteSession,
  deleteSession
);

export default router;
