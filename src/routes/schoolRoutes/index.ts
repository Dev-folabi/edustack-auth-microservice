import express from "express";
import {
  createSchool,
  deleteSchool,
  getAllSchools,
  getSchool,
  updateSchool,
} from "../../controllers/schoolController";
import {
  validateCreateSchool,
  validateDeleteSchool,
  validateGetSchool,
  validateUpdateSchool,
} from "../../middlewares/Validators";
import { roleAuthorization } from "../../middlewares/authorization";

const router = express.Router();

// Create School
router.post(
  "/",
  roleAuthorization(["admin"]),
  validateCreateSchool,
  createSchool
);

// Find Get School
router.get("/", getAllSchools);

// Get Single School
router.get("/:id", validateGetSchool, getSchool);

//  Update School
router.put(
  "/:id",
  roleAuthorization(["admin"]),
  validateUpdateSchool,
  updateSchool
);

// Delete School
router.delete(
  "/:id",
  roleAuthorization(["admin"]),
  validateDeleteSchool,
  deleteSchool
);

export default router;
