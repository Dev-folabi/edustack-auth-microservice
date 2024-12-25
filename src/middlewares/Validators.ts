import { Request, Response, NextFunction } from "express";
import { validationResult, body, param } from "express-validator";
import validator from "validator";

const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg || "Invalid data sent",
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Validation for creating a school
export const validateCreateSchool = [
  body("name").notEmpty().withMessage("School name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone")
    .optional()
    .isArray()
    .withMessage("Phone must be an array of strings")
    .custom((value: string[]) => {
      if (value.length < 1 || value.length > 3) {
        throw new Error(
          "Minimum of one phone number and a maximum of three are allowed"
        );
      }
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All phone numbers must be strings");
      }
      return true;
    }),
  body("address").notEmpty().withMessage("Address is required"),
  handleValidationErrors,
];

// Validation for updating a school
export const validateUpdateSchool = [
  param("id").isString().withMessage("School ID must be a string"),
  body("name").optional().notEmpty().withMessage("School name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone")
    .optional()
    .isArray()
    .withMessage("Phone must be an array of strings")
    .custom((value: string[]) => {
      if (value.length < 1 || value.length > 3) {
        throw new Error(
          "Minimum of one phone number and a maximum of three are allowed"
        );
      }
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All phone numbers must be strings");
      }
      return true;
    }),
  body("address").optional().notEmpty().withMessage("Address cannot be empty"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

// Validation for getting a school by ID
export const validateGetSchool = [
  param("id").isString().withMessage("School ID must be a string"),
  handleValidationErrors,
];

// Validation for deleting a school
export const validateDeleteSchool = [
  param("id").isString().withMessage("School ID must be a string"),
  handleValidationErrors,
];

// Validation for Super Admin Signup
export const validateSuperAdminSignUp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Passworg is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be string"),

  handleValidationErrors,
];

// Validation for Staff Signup
export const validateStaffSignUp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be string"),
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isString()
    .withMessage("School ID must be string"),
  body("role")
    .optional()
    .isString()
    .withMessage("Role must be string")
    .isIn(["admin", "teacher", "accountant", "librarian"])
    .withMessage(
      "Staff role can only be admin, teacher, accountant, or librarian"
    )
    .custom((value) => {
      if (value) {
        return value.toLowerCase();
      }
      return value;
    }),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("phone")
    .isArray()
    .withMessage("Phone must be an array of strings")
    .optional()
    .custom((value: string[]) => {
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All phone numbers must be strings");
      }
      return true;
    }),
  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isString()
    .withMessage("Gender must be a string")
    .custom((value) => {
      if (value) {
        return value.toLowerCase();
      }
      return value;
    }),
  body("designation")
    .optional()
    .isString()
    .withMessage("Designation must be a string"),
  body("dob")
    .optional()
    .isDate()
    .withMessage("Date of birth must be a valid date"),
  body("salary").optional().isNumeric().withMessage("Salary must be a number"),
  body("joining_date")
    .optional()
    .isDate()
    .withMessage("Joining date must be a valid date"),
  body("photo_url")
    .optional()
    .isString()
    .withMessage("Photo URL must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("qualification")
    .optional()
    .isString()
    .withMessage("Qualification must be a string"),
  body("notes").optional().isString().withMessage("Notes must be a string"),

  handleValidationErrors,
];

// Validation for Student Signup
export const validateStudentSignUp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be string"),
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isString()
    .withMessage("School ID must be string"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isString()
    .withMessage("Gender must be a string")
    .custom((value) => {
      if (value) {
        return value.toLowerCase();
      }
      return value;
    }),
  body("dob")
    .optional()
    .isDate()
    .withMessage("Date of birth must be a valid date"),
  body("phone")
    .optional()
    .isArray()
    .withMessage("Phone must be an array of strings")
    .custom((value: string[]) => {
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All phone numbers must be strings");
      }
      return true;
    }),
  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),
  body("admissionDate")
    .optional()
    .isDate()
    .withMessage("Admission date must be a valid date"),
  body("religion")
    .notEmpty()
    .withMessage("Religion is required")
    .isString()
    .withMessage("Religion must be a string"),
  body("bloodGroup")
    .optional()
    .isString()
    .withMessage("Blood group must be a string"),
  body("fatherName")
    .optional()
    .isString()
    .withMessage("Father's name must be a string"),
  body("motherName")
    .optional()
    .isString()
    .withMessage("Mother's name must be a string"),
  body("guardianName")
    .optional()
    .isString()
    .withMessage("Guardian's name must be a string"),
  body("guardianPhone")
    .optional()
    .isArray()
    .withMessage("Guardian phone must be an array of strings")
    .custom((value: string[]) => {
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All guardian phone numbers must be strings");
      }
      return true;
    }),
  body("fatherOccupation")
    .optional()
    .isString()
    .withMessage("Father's occupation must be a string"),
  body("motherOccupation")
    .optional()
    .isString()
    .withMessage("Mother's occupation must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),
  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),
  body("country")
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),
  body("routeVehicleId")
    .optional()
    .isString()
    .withMessage("Route vehicle ID must be a string"),
  body("roomId").optional().isString().withMessage("Room ID must be a string"),
  body("addedBy")
    .optional()
    .isString()
    .withMessage("Added by must be a string"),
  body("photoUrl")
    .optional()
    .isString()
    .withMessage("Photo URL must be a string"),
  body("parentId")
    .optional()
    .isString()
    .withMessage("Parent ID must be a string"),

  handleValidationErrors,
];

// Validation Sign in

export const validateSignIn = [
  body("emailOrUsername")
    .trim()
    .notEmpty()
    .withMessage("Email or Username is required")
    .custom((value) => {
      const isEmail = validator.isEmail(value);
      const isUsername = typeof value === "string" && value.length >= 3;
      if (!isEmail && !isUsername) {
        throw new Error(
          "Must be a valid email or a username with at least 3 characters"
        );
      }
      return true;
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  // .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])/)
  // .withMessage(
  //   "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
  // ),
  handleValidationErrors, // Middleware to handle validation errors
];
