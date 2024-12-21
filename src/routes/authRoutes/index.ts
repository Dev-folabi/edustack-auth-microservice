import express from 'express';
import {
  staffSignUp,
  studentSignUp,
  superAdminSignUp,
  userSignIn
} from '../../controllers/authController';
import { signUpvalidate } from '../../middlewares/customValidations';


const router = express.Router();

// Super Admin Signup
router.post("/admin-signup", signUpvalidate, superAdminSignUp);

// Staff Signup
router.post("/staff-signup", signUpvalidate, staffSignUp);

// Student Signup
router.post("/student-signup", studentSignUp);

// User Sign-in
router.post("/signin",  userSignIn);

export default router;
