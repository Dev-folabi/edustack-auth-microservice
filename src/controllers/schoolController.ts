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

    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   include: {
    //     staff: {
    //       include: {
    //         roles: true
    //       }
    //     }
    //   }
    // });

    // if (!user?.isSuperAdmin || !user?.staff?.roles.some(role => role.name === "admin")) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "You are not authorized to create a school",
    //   });
    // }

    const { name, email, phone, address } = req.body;
    const exsitSchool = await prisma.school.findUnique({
      where: { email, name },
    });
    if (exsitSchool) {
      return res.status(400).json({ error: "School already exists" });
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
      return res.status(400).json({
        success: false,
        message: "Unable to create school",
      });
    }

    await prisma.userSchool.create({
      data: {
        userId,
        schoolId: school.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "School created successfully",
      data: school,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Failed to create school",
      data: error || error.message,
    });
  }
};

// Get all schools
export const findAllSchools = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany();
    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schools found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Schools fetched successfully",
      data: schools,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch schools",
      data: error || error.message,
    });
  }
};

// Get school by id
export const findSchool = async (
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
      return res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
    }
    const school = await prisma.school.findUnique({
      where: { id },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Unable to fetch school",
      });
    }
    return res.status(200).json({
      status: true,
      message: "School fetched successfully",
      data: school,
    });
  } catch (error: any) {
    return res.status(400).json({
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
      return res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
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
      return res.status(404).json({
        success: false,
        message: "Unable to update school",
      });
    }
    return res.status(200).json({
      success: true,
      message: "School updated successfully",
      school,
    });
  } catch (error: any) {
    return res.status(400).json({
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
      return res.status(404).json({
        success: false,
        message: "School with this user not found",
      });
    }
    const school = await prisma.school.delete({
      where: { id },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete school",
      data: error || error.message,
    });
  }
};
