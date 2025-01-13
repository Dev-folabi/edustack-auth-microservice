import express from "express";
import {
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  createClass,
} from "../../controllers/classController";
import {
  validateCreateClass,
  validateUpdateClass,
} from "../../middlewares/Validators";

const router = express.Router();

// Class Routes
router.post("/", validateCreateClass, createClass);
router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.put("/:id", validateUpdateClass, updateClass);
router.delete("/:id", deleteClass);

export default router;
