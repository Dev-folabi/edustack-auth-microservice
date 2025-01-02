import express from "express";
import {
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  createClass,
} from "../../controllers/classController";
import { getAllSchoolClass, getSchoolClassById } from "../../controllers/schoolClassController";
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

// School Class Routes
router.get("/school/:id", getSchoolClassById);
router.get("/school/all-classes/:id", getAllSchoolClass);

export default router;
