import { Request, Response, NextFunction } from "express";
import { validationResult, body, param } from "express-validator";

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
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("address").notEmpty().withMessage("Address is required"),
  handleValidationErrors,
];

// Validation for updating a school
export const validateUpdateSchool = [
  param("id").isString().withMessage("School ID must be a string"),
  body("name").optional().notEmpty().withMessage("School name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
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
