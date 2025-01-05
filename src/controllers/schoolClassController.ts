import { NextFunction, Request, Response } from "express";
import { handleError } from "../error/errorHandler";
import prisma from "../prisma";

// Get All Classes for a School
export const getAllSchoolClass = async (
  req: Request<{ schId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const schoolId = req.params.schId;

    // Validate school existence
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolId },
    });
    if (!schoolExists) {
      return handleError(res, "School not found", 404);
    }

    // Retrieve all classes for the school
    const schoolClasses = await prisma.school_Class.findMany({
      where: { schoolId },
      include: {
        classes: {
          include: {
            sections: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "All school classes retrieved successfully",
      data: schoolClasses,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get a Specific Class for a School by Class ID
export const getSchoolClassById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    // Find the class and include its sections and associated school
    const foundClass = await prisma.school_Class.findUnique({
      where: { id: classId },
      include: {
        classes: {
          include: { sections: true },
        },
      },
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
