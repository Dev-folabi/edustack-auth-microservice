import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { Session } from "@prisma/client";
import { handleError } from "../error/errorHandler";

// Create Session
export const createSession = async (
  req: Request<{}, {}, Session>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start_date, end_date, ...data } = req.body;

    // Ensure start_date is earlier than end_date
    if (new Date(start_date) >= new Date(end_date)) {
      return handleError(res, "start_date must be earlier than end_date", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.session.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.session.create({
        data: {
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          ...data,
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Active Session
export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await prisma.session.findMany({
      where: { isActive: true },
    });

    res.status(200).json({
      success: true,
      message: "Active session retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get All Sessions
export const getAllSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await prisma.session.findMany();

    res.status(200).json({
      success: true,
      message: "All sessions retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Session by ID
export const getSessionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await prisma.session.findUnique({
      where: { id: req.params.id },
    });

    if (!result) {
      return handleError(res, "Session doesn't exist", 404);
    }

    res.status(200).json({
      success: true,
      message: "Session retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update Session
export const updateSession = async (
  req: Request<{ id: string }, {}, Partial<Session>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { start_date, end_date, ...data } = req.body;

    // Ensure start_date is earlier than end_date
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return handleError(res, "start_date must be earlier than end_date", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.session.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.session.update({
        where: { id: req.params.id },
        data: {
          ...(start_date && { start_date: new Date(start_date) }),
          ...(end_date && { end_date: new Date(end_date) }),
          ...data,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Delete Session
export const deleteSession = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
    });

    if (!session) {
      return handleError(res, "Session doesn't exist", 404);
    }

    if (session.isActive) {
      return handleError(res, "Cannot delete an active session", 400);
    }

    await prisma.session.delete({
      where: { id: session.id },
    });

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};
