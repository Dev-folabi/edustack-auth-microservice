import { NextFunction, Request, Response } from "express";
import { classSchoolRequest } from "../types/requests";
import { handleError } from "../error/errorHandler";
import prisma from "../prisma";

// Create Class
export const createClass = async (
  req: Request<{}, {}, classSchoolRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { label, section, school_id } = req.body;

    // Check if the class already exists
    const existingClass = await prisma.classes.findFirst({
      where: { label },
    });
    if (existingClass) {
      return handleError(res, "Class already exists", 400);
    }

    // Validate and deduplicate school IDs
    const uniqueSchoolIds = [...new Set(school_id)];
    const validSchoolData: { id: string; name: string }[] = [];

    // Validate school existence and fetch names
    const schools = await prisma.school.findMany({
      where: { id: { in: uniqueSchoolIds } },
    });

    const invalidSchoolIds = uniqueSchoolIds.filter(
      (id) => !schools.some((school) => school.id === id)
    );

    if (invalidSchoolIds.length > 0) {
      return handleError(res, "Invalid school provided", 400);
    }

    schools.forEach((school) => {
      validSchoolData.push({ id: school.id, name: school.name });
    });

    // Create class, associate with schools, and add sections
    const result = await prisma.$transaction(async (tx) => {
      // Create the class
      const createdClass = await tx.classes.create({
        data: { label },
      });

      // Create sections (can handle multiple sections)
      const sections = section.split(",").map((sec) => sec.trim());
      const createdSections = await tx.class_Section.createMany({
        data: sections.map((sec) => ({
          label: sec,
          classId: createdClass.id,
        })),
      });

      // Create school associations
      await tx.school_Class.createMany({
        data: validSchoolData.map((school) => ({
          classId: createdClass.id,
          schoolId: school.id,
        })),
      });

      return { createdClass, createdSections };
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get All Classes
export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const classes = await prisma.classes.findMany({
      include: {
        schoolClasses: true,
        sections: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "All classes retrieved successfully",
      data: classes,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Class by ID
export const getClassById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    const foundClass = await prisma.classes.findUnique({
      where: { id: classId },
      include: {
        schoolClasses: true,
        sections: true,
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

// Update Class
export const updateClass = async (
  req: Request<{ id: string }, {}, Partial<classSchoolRequest>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: classId } = req.params;
    const { label, section, school_id } = req.body;

    // Fetch existing class
    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
      include: { schoolClasses: true, sections: true },
    });

    if (!existingClass) {
      return handleError(res, "Class not found", 404);
    }

    const existingSchoolIds = existingClass.schoolClasses.map(
      (sc) => sc.schoolId
    );
    const uniqueSchoolIds = [...new Set(school_id ?? [])];

    // Validate the provided school IDs
    const schools = await prisma.school.findMany({
      where: { id: { in: uniqueSchoolIds } },
    });

    const invalidSchoolIds = uniqueSchoolIds.filter(
      (id) => !schools.some((school) => school.id === id)
    );

    if (invalidSchoolIds.length > 0) {
      return handleError(res, "Invalid school provided", 400);
    }

    const validSchoolData = schools.map((school) => ({
      id: school.id,
      name: school.name,
    }));

    // Determine schools to add and remove
    const schoolsToAdd = validSchoolData.filter(
      (school) => !existingSchoolIds.includes(school.id)
    );
    const schoolsToRemove = existingSchoolIds.filter(
      (id) => !uniqueSchoolIds.includes(id)
    );

    // Update class and school associations
    const updatedClass = await prisma.$transaction(async (tx) => {
      // Update class details
      const updated = await tx.classes.update({
        where: { id: classId },
        data: { label: label ?? existingClass.label },
      });

      // Update sections
      if (section) {
        const sections = section.split(",").map((sec) => sec.trim());
        await tx.class_Section.deleteMany({
          where: { classId },
        });
        await tx.class_Section.createMany({
          data: sections.map((sec) => ({
            label: sec,
            classId,
          })),
        });
      }

      // Add new school associations
      if (schoolsToAdd.length > 0) {
        await tx.school_Class.createMany({
          data: schoolsToAdd.map((school) => ({
            classId,
            schoolId: school.id,
          })),
        });
      }

      // Remove outdated school associations
      if (schoolsToRemove.length > 0) {
        await tx.school_Class.deleteMany({
          where: {
            classId,
            schoolId: { in: schoolsToRemove },
          },
        });
      }

      return updated;
    });

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    next(error);
  }
};

// Delete Class
export const deleteClass = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return handleError(res, "Class not found", 404);
    }

    // Delete associated relationships first
    await prisma.school_Class.deleteMany({
      where: { classId },
    });

    await prisma.class_Section.deleteMany({
      where: { classId },
    });

    await prisma.classes.delete({
      where: { id: classId },
    });

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};
