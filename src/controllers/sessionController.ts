import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { SessionRequest } from "../types/requests/index";
import { handleError } from "../error/errorHandler";

// Create Session and Terms
export const createSessionWithTerms = async (
  req: Request<{}, {}, SessionRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { label, start_date, end_date, isActive, terms } = req.body;

    // Ensure start_date is earlier than end_date
    if (new Date(start_date) >= new Date(end_date)) {
      return handleError(res, "start date must be earlier than end date", 400);
    }

    // Ensure there are terms provided
    if (!terms || terms.length === 0) {
      return handleError(res, "At least one term must be provided", 400);
    }

    // Ensure terms start and end dates are valid
    for (const term of terms) {
      if (new Date(term.start_date) >= new Date(term.end_date)) {
        return handleError(res, `Term ${term.label} has invalid dates`, 400);
      }
    }

    // Start a transaction to ensure atomicity (Session and Terms are created together)
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate any active session if new session is active
      if (isActive) {
        await tx.session.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      // Create the session
      const session = await tx.session.create({
        data: {
          label,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          isActive,
        },
      });

      // Create the terms for the session
      const createdTerms = await Promise.all(
        terms.map((term) =>
          tx.term.create({
            data: {
              sessionId: session.id,
              label: `${session.label} ${term.label}`,
              start_date: new Date(term.start_date),
              end_date: new Date(term.end_date),
            },
          })
        )
      );

      return { session, createdTerms };
    });

    res.status(201).json({
      success: true,
      message: "Session and terms created successfully",
      data: {
        session: result.session,
        terms: result.createdTerms,
      },
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
      include: {
        terms: true, // Include terms for active session
      },
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
    const result = await prisma.session.findMany({
      include: {
        terms: true,
      },
    });

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
      include: {
        terms: true,
      },
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
export const updateSessionWithTerms = async (
  req: Request<{ id: string }, {}, Partial<SessionRequest>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { label, start_date, end_date, isActive, terms } = req.body;

    // Ensure start_date is earlier than end_date
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return handleError(res, "start_date must be earlier than end_date", 400);
    }

    // Ensure terms start and end dates are valid
    if (terms) {
      for (const term of terms) {
        if (new Date(term.start_date) >= new Date(term.end_date)) {
          return handleError(res, `Term ${term.label} has invalid dates`, 400);
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (isActive) {
        // Deactivate any active session if new session is active
        await tx.session.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      // Update the session
      const updatedSession = await tx.session.update({
        where: { id: req.params.id },
        data: {
          ...(label && { label }),
          ...(start_date && { start_date: new Date(start_date) }),
          ...(end_date && { end_date: new Date(end_date) }),
          isActive,
        },
      });

      // Create or update terms for the session
      const updatedTerms = terms
        ? await Promise.all(
            terms.map((term) => {
              return tx.term.upsert({
                where: {
                  label_sessionId: {
                    label: `${updatedSession.label} ${term.label}`,
                    sessionId: updatedSession.id,
                  },
                },
                create: {
                  sessionId: updatedSession.id,
                  label: term.label,
                  start_date: new Date(term.start_date),
                  end_date: new Date(term.end_date),
                },
                update: {
                  start_date: new Date(term.start_date),
                  end_date: new Date(term.end_date),
                },
              });
            })
          )
        : [];

      return { updatedSession, updatedTerms };
    });

    res.status(200).json({
      success: true,
      message: "Session and terms updated successfully",
      data: {
        session: result.updatedSession,
        terms: result.updatedTerms,
      },
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
      include: {
        terms: true,
      },
    });

    if (!session) {
      return handleError(res, "Session doesn't exist", 404);
    }

    if (session.isActive) {
      return handleError(res, "Cannot delete an active session", 400);
    }

    // Start a transaction to delete the session and its related terms
    await prisma.$transaction(async (tx) => {
      // Delete terms associated with the session
      await tx.term.deleteMany({
        where: { sessionId: session.id },
      });

      // Delete the session
      await tx.session.delete({
        where: { id: session.id },
      });
    });

    res.status(200).json({
      success: true,
      message: "Session and associated terms deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

// Get All Term
export const getAllTerms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const terms = await prisma.term.findMany();

    res.status(200).json({
      success: true,
      message: "All terms retrieved successfully",
      data: terms,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Term By ID
export const getTermById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const term = await prisma.term.findUnique({
      where: { id: req.params.id },
    });

    if (!term) {
      return handleError(res, "Term doesn't exist", 404);
    }

    res.status(200).json({
      success: true,
      message: "Term retrieved successfully",
      data: term,
    });
  } catch (error: any) {
    next(error);
  }
};
