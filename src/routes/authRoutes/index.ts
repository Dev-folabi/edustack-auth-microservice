import express from "express";
import {
  staffSignUp,
  studentSignUp,
  superAdminSignUp,
  userSignIn,
} from "../../controllers/authController";
import { signUpvalidate } from "../../middlewares/customValidations";
import {
  validateSignIn,
  validateStaffSignUp,
  validateStudentSignUp,
  validateSuperAdminSignUp,
} from "../../middlewares/Validators";

const router = express.Router();

// Super Admin Signup
router.post(
  "/admin-signup",
  validateSuperAdminSignUp,
  signUpvalidate,
  superAdminSignUp
);

// Staff Signup
router.post("/staff-signup", validateStaffSignUp, signUpvalidate, staffSignUp);

// Student Signup
router.post("/student-signup", validateStudentSignUp, signUpvalidate, studentSignUp);

// User Sign-in
router.post("/signin", validateSignIn, userSignIn);

export default router;
