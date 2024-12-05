import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserRequest } from "../types/requests";
import { generateToken } from "../function/token";

// Super Admin Sign Up
export const superAdminSignUp = async (
  req: Request<{}, {}, IUserRequest>,
  res: Response
) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Unable to created User",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error || error.message,
    });
  }
};

// Super Admin Sign In
export const superAdminSignIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = generateToken({ id: user.id });

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error || error.message,
    });
  }
};
