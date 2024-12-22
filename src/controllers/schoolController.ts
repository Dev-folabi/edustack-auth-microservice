import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { ISchoolRequest } from "../types/requests";
import { getIdFromToken } from "../function/token";
import { validateUserSchool } from "../function/schoolFunctions";
import { handleError } from "../error/errorHandler";



// Create a new school
export const createSchool = async (
  req: Request<{}, {}, ISchoolRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return handleError(res, "Authorization header is missing", 401);

    const userId = getIdFromToken(authHeader);
    const { name, email, phone, address } = req.body;

    // Check if the school already exists
    const existingSchool = await prisma.school.findFirst({ where: { name } });
    if (existingSchool) return handleError(res, "School already exists", 400);

    // Check user school limit
    const schoolList = await prisma.userSchool.findMany();
    if (schoolList.length >= 3)
      return handleError(res, "School limit of 3 reached", 400);

    // Create school
    const school = await prisma.school.create({
      data: { name, email, phone, address },
    });

    // Link school to user
    await prisma.userSchool.create({
      data: { userId, schoolId: school.id },
    });

    res.status(201).json({
      success: true,
      message: "School created successfully",
      data: school,
    });
  } catch (error: any) {
    console.error("Error in createSchool:", error);
    next(error);
  }
};

// Get all schools
export const getAllSchools = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return handleError(res, "Authorization header is missing", 401);

    const userId = getIdFromToken(authHeader);

    const schools = await prisma.school.findMany({
      where: {
        userSchools: { some: { userId } },
      },
    });

    if (!schools.length) {
      return handleError(res, "No schools found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Schools fetched successfully",
      data: schools,
    });
  } catch (error: any) {
    console.error("Error in getAllSchools:", error);
    next(error);
  }
};

// Get school by id
export const getSchool = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return handleError(res, "Authorization header is missing", 401);

    const userId = getIdFromToken(authHeader);
    const { id: schoolId } = req.params;

    const userSchool = await validateUserSchool(userId, schoolId);
    if (!userSchool)
      return handleError(res, "School with this user not found", 404);

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) return handleError(res, "School not found", 404);

    res.status(200).json({
      success: true,
      message: "School fetched successfully",
      data: school,
    });
  } catch (error: any) {
    console.error("Error in getSchool:", error);
    next(error);
  }
};

// Update school
export const updateSchool = async (
  req: Request<{ id: string }, {}, Partial<ISchoolRequest>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return handleError(res, "Authorization header is missing", 401);

    const userId = getIdFromToken(authHeader);
    const { id: schoolId } = req.params;

    const userSchool = await validateUserSchool(userId, schoolId);
    if (!userSchool)
      return handleError(res, "School with this user not found", 404);

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "School updated successfully",
      data: updatedSchool,
    });
  } catch (error: any) {
    console.error("Error in updateSchool:", error);
    next(error);
  }
};

// Delete school
export const deleteSchool = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return handleError(res, "Authorization header is missing", 401);

    const userId = getIdFromToken(authHeader);
    const { id: schoolId } = req.params;

    const userSchool = await validateUserSchool(userId, schoolId);
    if (!userSchool)
      return handleError(res, "School with this user not found", 404);

    await prisma.school.delete({ where: { id: schoolId } });

    res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteSchool:", error);
    next(error);
  }
};
