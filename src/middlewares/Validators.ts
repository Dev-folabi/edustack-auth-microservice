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
    .customSanitizer((value) => {
      return value ? value.toLowerCase() : value;
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
    .customSanitizer((value) => {
      return value ? value.toLowerCase() : value;
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
    .customSanitizer((value) => {
      return value ? value.toLowerCase() : value;
    }),
  body("dob")
    .optional()
    .isDate()
    .withMessage("Date of birth must be a valid date"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
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
  body("blood_group")
    .optional()
    .isString()
    .withMessage("Blood group must be a string"),
  body("father_name")
    .optional()
    .isString()
    .withMessage("Father's name must be a string"),
  body("mother_name")
    .optional()
    .isString()
    .withMessage("Mother's name must be a string"),
  body("guardian_name")
    .optional()
    .isString()
    .withMessage("Guardian's name must be a string"),
  body("guardian_phone")
    .notEmpty()
    .withMessage("guardian phone is required")
    .isArray()
    .withMessage("Guardian phone must be an array of strings")
    .custom((value: string[]) => {
      if (!value.every((v) => typeof v === "string")) {
        throw new Error("All guardian phone numbers must be strings");
      }
      return true;
    }),
  body("father_occupation")
    .optional()
    .isString()
    .withMessage("Father's occupation must be a string"),
  body("mother_occupation")
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
  body("route_vehicle_id")
    .optional()
    .isString()
    .withMessage("Route vehicle ID must be a string"),
  body("room_id").optional().isString().withMessage("Room ID must be a string"),
  body("added_by")
    .optional()
    .isString()
    .withMessage("Added by must be a string"),
  body("photo_url")
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

export const validateCreateSession = [
  body("label")
    .trim()
    .notEmpty()
    .withMessage("Label is required")
    .isString()
    .withMessage("Label must be a string"),
  body("start_date")
    .trim()
    .notEmpty()
    .withMessage("Start date is required")
    .isDate()
    .withMessage("End date must be a valid date"),
  body("end_date")
    .trim()
    .notEmpty()
    .withMessage("End date is required")
    .isDate()
    .withMessage("End date must be a valid date"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean"),
  body("terms")
    .isArray({ min: 1 })
    .withMessage("At least one term must be provided")
    .custom((terms) => {
      terms.forEach((term: any) => {
        if (!term.label) throw new Error("Each term must have a label");
        if (!term.start_date || !term.end_date)
          throw new Error("Each term must have start and end dates");
        if (new Date(term.start_date) >= new Date(term.end_date))
          throw new Error(
            `Term "${term.label}" has invalid dates: start_date must be earlier than end_date`
          );
      });
      return true;
    }),
  handleValidationErrors,
];

export const validateUpdateSession = [
  body("label").optional().isString().withMessage("Label must be a string"),
  body("start_date")
    .optional()
    .isDate()
    .withMessage("Start date must be a valid date"),
  body("end_date")
    .optional()
    .isDate()
    .withMessage("End date must be a valid date"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean"),
  body("terms")
    .optional()
    .isArray()
    .withMessage("Terms must be an array")
    .custom((terms) => {
      terms.forEach((term: any) => {
        if (!term.label) throw new Error("Each term must have a label");
        if (!term.start_date || !term.end_date)
          throw new Error("Each term must have start and end dates");
        if (new Date(term.start_date) >= new Date(term.end_date))
          throw new Error(
            `Term "${term.label}" has invalid dates: start_date must be earlier than end_date`
          );
      });
      return true;
    }),
  handleValidationErrors,
];

export const validateDeleteSession = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Session ID is required")
    .isString()
    .withMessage("Session ID must be a string"),
  handleValidationErrors,
];

// Validator for creating a class
export const validateCreateClass = [
  body("label")
    .notEmpty()
    .withMessage("Label is required")
    .isString()
    .withMessage("Label must be a string"),
  body("section")
    .optional()
    .isString()
    .withMessage("Section must be an string"),
  // .custom((value: unknown[]) => {
  //   if (!value.every((item) => typeof item === "string")) {
  //     throw new Error("Each section must be a string");
  //   }
  //   return true;
  // }),
  body("school_id")
    .notEmpty()
    .withMessage("School IDs are required")
    .isArray()
    .withMessage("School IDs must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each school ID must be a string");
      }
      return true;
    }),
  handleValidationErrors,
];

// Validator for updating a class
export const validateUpdateClass = [
  param("id")
    .notEmpty()
    .withMessage("Class ID is required")
    .isString()
    .withMessage("Class ID must be a string"),
  body("label").optional().isString().withMessage("Label must be a string"),
  body("section")
    .optional()
    .isString()
    .withMessage("Section must be an string"),
  // .custom((value: unknown[]) => {
  //   if (!value.every((item) => typeof item === "string")) {
  //     throw new Error("Each section must be a string");
  //   }
  //   return true;
  // }),
  body("school_id")
    .optional()
    .isArray()
    .withMessage("School IDs must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each school ID must be a string");
      }
      return true;
    }),
  handleValidationErrors,
];
