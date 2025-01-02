import { NextFunction, Request, Response } from "express";
import { classSchoolRequest } from "../types/requests";
import { handleError } from "../error/errorHandler";
import prisma from "../prisma";

// Create Class

// Get All Classes
export const getAllSchoolClass = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classes = await prisma.school_Class.findMany({
      where: { school_id: req.params.id },
      include: { classes: true },
    });
    res.status(200).json({
      success: true,
      message: "All School classes retrieved successfully",
      data: classes,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Class by ID
export const getSchoolClassById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    const foundClass = await prisma.classes.findUnique({
      where: { id: classId },
      include: { school_class: true },
    });

    if (!foundClass) {
      return handleError(res, "Class not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Class retrieved successfully",
      data: foundClass,
    });
  } catch (error: any) {
    next(error);
  }
};
