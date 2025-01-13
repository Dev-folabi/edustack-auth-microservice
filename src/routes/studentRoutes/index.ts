import express from "express";
import {
  enrollStudent,
  promoteStudent,
  transferStudent,
} from "../../controllers/studentController";
import {
  validateEnrollStudent,
  validatePromoteStudent,
  validateTransferStudent,
} from "../../middlewares/Validators";

const router = express.Router();

router.post("/enroll", validateEnrollStudent, enrollStudent);
router.put("/promote", validatePromoteStudent, promoteStudent);
router.put("/transfer", validateTransferStudent, transferStudent);

export default router;
