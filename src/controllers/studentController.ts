import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { handleError } from "../error/errorHandler";
import { EnrollStudentRequest, PromoteStudentRequest, TransferStudentRequest } from "../types/requests";
import { getIdFromToken } from "../function/token";
import {
  findActiveSession,
  findClassWithSections,
} from "../function/schoolFunctions";
import { findStudent } from "../function/schoolFunctions";

// Enroll Student
export const enrollStudent = async (
  req: Request<{id: string}, {}, EnrollStudentRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: studentId } = req.params;
    const { classId, sectionId } = req.body;

    // Validate inputs
    if (!classId || !sectionId) {
      return handleError(res, "Class ID and Section ID are required", 400);
    }

    // Validate entities
    const student = await findStudent(studentId, res);
    if (!student) return;

    const classInfo = await findClassWithSections(classId, res);
    if (!classInfo) return;

    const sectionInfo = classInfo.sections.find(
      (section) => section.id === sectionId
    );
    if (!sectionInfo) {
      return handleError(res, "Section not found in class", 404);
    }

    const session = await findActiveSession(res);
    if (!session) return;

    const activeTerm = session.terms.find((term) => term.isActive);
    if (!activeTerm) {
      return handleError(res, "No active term in session", 400);
    }

    // Enroll student
    const enrolledStudent = await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        classId: classInfo.id,
        sectionId: sectionInfo.id,
        sessionId: session.id,
        termId: activeTerm.id,
        status: "enrolled",
      },
    });

    res.status(200).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrolledStudent,
    });
  } catch (error) {
    next(error);
  }
};

// Promote Student
export const promoteStudent = async (
  req: Request<{}, {}, PromoteStudentRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, fromClassId, toClassId, sectionId } = req.body;
    const promotedBy = getIdFromToken(req);

    // Validate entities
    const fromClass = await findClassWithSections(fromClassId, res);
    if (!fromClass) return;

    const toClass = await findClassWithSections(toClassId, res);
    if (!toClass) return;

    const sectionInfo = toClass.sections.find(
      (section) => section.id === sectionId
    );
    if (!sectionInfo) {
      return handleError(res, "Section not found in class", 404);
    }

    const session = await findActiveSession(res);
    if (!session) return;

    const activeTerm = session.terms.find((term) => term.isActive);
    if (!activeTerm) {
      return handleError(res, "No active term in session", 400);
    }

    // Perform promotion in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark previous enrollment as "promoted"
      await tx.studentEnrollment.updateMany({
        where: { studentId: { in: studentId }, classId: fromClassId },
        data: { status: "promoted" },
      });

      // Add to promotion history
      await tx.promotionHistory.createMany({
        data: studentId.map((id: string) => ({
          studentId: id,
          fromClassId,
          toClassId,
          sessionId: session.id,
          termId: activeTerm.id,
          promotedBy,
        })),
      });

      // Enroll students in the new class
      await tx.studentEnrollment.createMany({
        data: studentId.map((id: string) => ({
          studentId: id,
          classId: toClassId,
          sectionId,
          sessionId: session.id,
          termId: activeTerm.id,
          status: "enrolled",
        })),
      });
    });

    res.status(200).json({
      success: true,
      message: "Students promoted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Transfer Student
export const transferStudent = async (
  req: Request<{}, {}, TransferStudentRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, fromSchoolId, toSchoolId, transferReason } = req.body;

    // Create a transfer record
    const transfer = await prisma.studentTransfer.createMany({
      data: studentId.map((id: string) => ({
        studentId: id,
        fromSchoolId,
        toSchoolId,
        transferReason: transferReason || undefined,
        transferDate: new Date(),
      })),
    });

    res.status(200).json({
      success: true,
      message: "Student transferred successfully",
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};
