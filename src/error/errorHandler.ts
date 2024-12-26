import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P1001":
        // Can't reach database server
        return res.status(400).json({
          success: false,
          message: "Can't reach database server",
          data: error.meta || {},
        });

      case "P2000":
        // Value too long for the column
        return res.status(400).json({
          success: false,
          message: "Input value is too long for the column",
          data: error.meta || {},
        });

      case "P2001":
        // Record not found
        return res.status(404).json({
          success: false,
          message: "Record not found",
          data: error.meta || {},
        });

      case "P2002":
        // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: "Unique constraint violation",
          data: error.meta || {},
        });

      case "P2003":
        // Foreign key constraint failed
        return res.status(400).json({
          success: false,
          message: "Foreign key constraint failed",
          data: error.meta || {},
        });

      case "P2004":
        // A constraint failed on the database
        return res.status(400).json({
          success: false,
          message: "A database constraint failed",
          data: error.meta || {},
        });

      case "P2005":
        // Invalid value for a column
        return res.status(400).json({
          success: false,
          message: "Invalid value provided for a column",
          data: error.meta || {},
        });

      case "P2006":
        // Invalid value for a field
        return res.status(400).json({
          success: false,
          message: "Invalid value provided for a field",
          data: error.meta || {},
        });

      case "P2007":
        // Data validation error
        return res.status(400).json({
          success: false,
          message: "Data validation error",
          data: error.meta || {},
        });

      case "P2008":
        // Failed to parse query
        return res.status(500).json({
          success: false,
          message: "Query parsing error",
          data: error.meta || {},
        });

      case "P2009":
        // Failed to validate query
        return res.status(500).json({
          success: false,
          message: "Query validation error",
          data: error.meta || {},
        });

      case "P2010":
        // Raw query failed
        return res.status(500).json({
          success: false,
          message: "Raw query execution failed",
          data: error.meta || {},
        });

      case "P2011":
        // Null constraint violation
        return res.status(400).json({
          success: false,
          message: "Null constraint violation",
          data: error.meta || {},
        });

      case "P2012":
        // Missing a required value
        return res.status(400).json({
          success: false,
          message: "Missing a required value",
          data: error.meta || {},
        });

      case "P2013":
        // Missing `WHERE` clause
        return res.status(400).json({
          success: false,
          message: "Missing WHERE clause",
          data: error.meta || {},
        });

      case "P2014":
        // Relation violation
        return res.status(400).json({
          success: false,
          message: "Relation violation detected",
          data: error.meta || {},
        });

      case "P2015":
        // Related record not found
        return res.status(404).json({
          success: false,
          message: "Related record not found",
          data: error.meta || {},
        });

      case "P2016":
        // Query interpretation error
        return res.status(500).json({
          success: false,
          message: "Query interpretation error",
          data: error.meta || {},
        });

      case "P2017":
        // Records for the relation are not connected
        return res.status(400).json({
          success: false,
          message: "Records for the relation are not connected",
          data: error.meta || {},
        });

      case "P2018":
        // Required connected records not found
        return res.status(400).json({
          success: false,
          message: "Required connected records not found",
          data: error.meta || {},
        });

      case "P2019":
        // Input error
        return res.status(400).json({
          success: false,
          message: "Input error",
          data: error.meta || {},
        });

      case "P2020":
        // Value out of range
        return res.status(400).json({
          success: false,
          message: "Value out of range for the column",
          data: error.meta || {},
        });

      case "P2021":
        // Table not found
        return res.status(500).json({
          success: false,
          message: "Table not found in the database",
          data: error.meta || {},
        });

      case "P2022":
        // Column not found
        return res.status(500).json({
          success: false,
          message: "Column not found in the database",
          data: error.meta || {},
        });

      case "P2023":
        // Inconsistent column data
        return res.status(500).json({
          success: false,
          message: "Inconsistent column data",
          data: error.meta || {},
        });

      case "P2024":
        // Timeout
        return res.status(503).json({
          success: false,
          message: "Operation timed out",
          data: error.meta || {},
        });

      case "P2025":
        // Record to delete does not exist
        return res.status(404).json({
          success: false,
          message: "Record to delete does not exist",
          data: error.meta || {},
        });

      case "P2026":
        // Database server error
        return res.status(500).json({
          success: false,
          message: "Database server error",
          data: error.meta || {},
        });

      default:
        // Catch-all for unknown Prisma errors
        return res.status(500).json({
          success: false,
          message: `An unknown database error occurred (code: ${error.code})`,
          data: error.meta || {},
        });
    }
  }

  // Handle Prisma Initialization Errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      success: false,
      message: "Failed to initialize database connection.",
    });
  }

  // Handle Prisma Client Validation Errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error. Please check your input data.",
      data: error.message.split("\n").slice(-1)[0],
    });
  }

  // Handle other non-Prisma errors
  console.error("Unhandled Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: error.message || error,
  });
};

// Unified error response helper
export const handleError = (
  res: Response,
  message: string,
  status = 400,
  data = null
) => {
  res.status(status).json({ success: false, message, data });
};
