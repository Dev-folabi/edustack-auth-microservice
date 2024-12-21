import { Request, Response } from "express";
import prisma from "../prisma";
import { ISchoolRequest } from "../types/requests";
import { getIdFromToken } from "../function/token";

// Create a new school
export const createSchool = async (
  req: Request<{}, {}, ISchoolRequest>,
  res: Response
) => {
  try {
    const userId = getIdFromToken(req.headers.authorization);

    const { name, email, phone, address } = req.body;
    const exsitSchool = await prisma.school.findFirst({
      where: { name },
    });
    if (exsitSchool) {
      res.status(400).json({ error: "School already exists" });
      return;
    }

    const schoolList = await prisma.userSchool.findMany({
      where: { userId },
    });

    if (schoolList.length >= 3) {
      res.status(400).json({ error: "School Limit of 3 Reached" });
      return;
    }

    const school = await prisma.school.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    if (!school) {
      res.status(400).json({
        success: false,
        message: "Unable to create school",
      });
      return;
    }

    await prisma.userSchool.create({
      data: {
        userId,
        schoolId: school.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "School created successfully",
      data: school,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create school",
      data: error || error.message,
    });
  }
};

// Get all schools
export const getAllSchools = async (req: Request, res: Response) => {
  try {
    const userId = getIdFromToken(req.headers.authorization);

    const schools = await prisma.school.findMany({
      where: {
        userSchools: {
          some: { userId },
        },
      },
    });
    if (schools.length === 0) {
      res.status(404).json({
        success: false,
        message: "No schools found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Schools fetched successfully",
      data: schools,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch schools",
      data: error || error.message,
    });
  }
};

// Get school by id
export const getSchool = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userId = getIdFromToken(req.headers.authorization);
    const { id } = req.params;

    const userSchool = await prisma.userSchool.findUnique({
      where: { userId_schoolId: { userId, schoolId: id } },
    });

    if (!userSchool) {
      res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
      return;
    }
    const school = await prisma.school.findUnique({
      where: { id },
    });
    if (!school) {
      res.status(404).json({
        success: false,
        message: "Unable to fetch school",
      });
      return;
    }
    res.status(200).json({
      status: true,
      message: "School fetched successfully",
      data: school,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch school",
      data: error || error.message,
    });
  }
};

// Update school
export const updateSchool = async (
  req: Request<{ id: string }, {}, Partial<ISchoolRequest>>,
  res: Response
) => {
  try {
    const userId = getIdFromToken(req.headers.authorization);
    const { name, email, phone, address, isActive } = req.body;
    const { id } = req.params;

    const userSchool = await prisma.userSchool.findUnique({
      where: { userId_schoolId: { userId, schoolId: id } },
    });

    if (!userSchool) {
      res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
      return;
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        isActive,
      },
    });
    if (!school) {
      res.status(404).json({
        success: false,
        message: "Unable to update school",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "School updated successfully",
      school,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update school",
      data: error || error.message,
    });
  }
};

// Delete school
export const deleteSchool = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userId = getIdFromToken(req.headers.authorization);
    const { id } = req.params;

    const userSchool = await prisma.userSchool.findUnique({
      where: { userId_schoolId: { userId, schoolId: id } },
    });

    if (!userSchool) {
      res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
      return;
    }
    const school = await prisma.school.delete({
      where: { id },
    });
    if (!school) {
      res.status(404).json({
        success: false,
        message: "School not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to delete school",
      data: error || error.message,
    });
  }
};
