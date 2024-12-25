import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import _ from "lodash";
import {
  IUserRequest,
  IStaffRequest,
  IStudentRequest,
} from "../types/requests";
import { generateToken } from "../function/token";
import { Gender, UserRole } from "@prisma/client";
import { validateSchool } from "../function/schoolFunctions";
import { handleError } from "../error/errorHandler";

// Super Admin Sign Up
export const superAdminSignUp = async (
  req: Request<{}, {}, IUserRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username, isSuperAdmin: true },
      select: {
        id: true,
        email: true,
        username: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = generateToken({ id: user.id });

    // Send success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user, token },
    });
  } catch (error: any) {
    next(error);
  }
};

// Staff Sign Up
export const staffSignUp = async (
  req: Request<{}, {}, IStaffRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      username,
      email,
      password,
      name,
      phone,
      address,
      schoolId,
      designation,
      role,
      dob,
      salary,
      joining_date,
      gender,
      photo_url,
      qualification,
      notes,
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate school existence
    const school = await validateSchool(String(schoolId));
    if (!school) {
      return handleError(res, "School not found", 404);
    }

    let newUser!: { id: string };
    await prisma.$transaction(async (tx) => {
      // Create user
      newUser = await tx.user.create({
        data: { email, password: hashedPassword, username },
        select: { id: true },
      });

      // Link user to school
      await tx.userSchool.create({
        data: {
          userId: newUser.id,
          schoolId: school.id,
          role: role as UserRole,
        },
      });

      // Create staff profile
      await tx.staff.create({
        data: {
          userId: newUser.id,
          name,
          phone,
          email,
          address,
          designation,
          dob: new Date(String(dob)),
          salary,
          joining_date: new Date(String(joining_date)),
          gender,
          photo_url,
          qualification,
          notes,
        },
      });
    });

    // Generate token
    const token = generateToken({ id: newUser.id });

    // Success response
    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: { userId: newUser.id, token },
    });
  } catch (error: any) {
    console.error("Error in staffSignUp:", error);
    next(error);
  }
};

// Student Sign Up

export const studentSignUp = async (
  req: Request<{}, {}, IStudentRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username, schoolId, ...studentData } = req.body;

    // Validate school existence
    const school = await validateSchool(String(schoolId));

    if (!school) {
      return handleError(res, "School not found", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser!: { id: string };
    const { parentId, ...studentDataWithoutId } = studentData;

    await prisma.$transaction(async (tx) => {
      newUser = await tx.user.create({
        data: { email, password: hashedPassword, username },
        select: { id: true },
      });

      await tx.userSchool.create({
        data: { userId: newUser.id, schoolId: school.id, role: "student" },
      });

      await tx.student.create({
        data: {
          userId: newUser.id,
          parentId: String(parentId) || undefined,
          ...studentDataWithoutId,
        },
      });
    });

    // Generate token
    const token = generateToken({ id: newUser.id });

    // Success response
    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: { userId: newUser.id, token },
    });
  } catch (error: any) {
    next(error);
  }
};

// User Sign In
export const userSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
      select: {
        id: true,
        email: true,
        username: true,
        isSuperAdmin: true,
        userSchools: true,
        staff: true,
        student: true,
        parent: true,
        password: true,
      },
    });

    if (!user) {
      return handleError(res, "User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, "Invalid login details", 401);
    }

    const token = generateToken({ id: user.id });

    const userWithoutPassword = _.omit(user, ["password"]);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { userWithoutPassword, token },
    });
  } catch (error) {
    next(error);
  }
};
