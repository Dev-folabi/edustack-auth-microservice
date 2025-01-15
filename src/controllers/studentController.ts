import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { handleError } from "../error/errorHandler";
import {
  EnrollStudentRequest,
  PromoteStudentRequest,
  TransferStudentRequest,
} from "../types/requests";
import { getIdFromToken } from "../function/token";
import {
  findActiveSession,
  findClassWithSections,
} from "../function/schoolFunctions";
import { findStudent } from "../function/schoolFunctions";

// Enroll Student
export const enrollStudent = async (
  req: Request<{}, {}, EnrollStudentRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, classId, sectionId } = req.body;

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

// Get Students by School
export const getStudentsBySchool = async (
  req: Request<
    { schoolId: string },
    {},
    {},
    { classId?: string; name?: string; admissionNumber?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolId } = req.params;
    const { classId, name, admissionNumber } = req.query;

    // Validate schoolId
    if (!schoolId) {
      return handleError(res, "School ID is required", 400);
    }

    // Build query filters
    const filters: any = { schoolId };

    if (classId) {
      filters.user = {
        student: {
          student_enrolled: { some: { classId } },
        },
      };
    }

    if (name) {
      filters.user = {
        ...filters.user,
        student: {
          ...filters.user?.student,
          name: { contains: name, mode: "insensitive" },
        },
      };
    }

    if (admissionNumber) {
      filters.user = {
        ...filters.user,
        student: {
          ...filters.user?.student,
          admission_number: parseInt(admissionNumber, 10),
        },
      };
    }

    // Fetch students with related data
    const students = await prisma.userSchool.findMany({
      where: {
        schoolId,
        user: {
          student: {
            student_enrolled: {
              some: { class: { schoolId } },
            },
          },
        },
      },
      include: {
        school: true,
        user: {
          include: {
            student: {
              include: {
                student_enrolled: {
                  include: { class: true },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// Get Student Details
export const getStudentDetails = async (
  req: Request<{ studentId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    // Validate studentId
    if (!studentId) {
      return handleError(res, "Student ID is required", 400);
    }

    // Fetch student details with related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
        parent: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        student_enrolled: {
          include: {
            class: {
              select: {
                label: true,
              },
            },
            section: {
              select: {
                label: true,
              },
            },
            session: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });

    // If no student found
    if (!student) {
      return handleError(res, "Student not found", 404);
    }

    // Return the response
    res.status(200).json({
      success: true,
      message: "Student details fetched successfully",
      data: student,
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

    // Validate from and to classes
    const fromClass = await findClassWithSections(fromClassId, res);
    if (!fromClass) return;

    const toClass = await findClassWithSections(toClassId, res);
    if (!toClass) return;

    // Validate section in the destination class
    const sectionInfo = toClass.sections.find(
      (section) => section.id === sectionId
    );
    if (!sectionInfo) {
      return handleError(
        res,
        "Section not found in the destination class",
        404
      );
    }

    // Validate session and active term
    const session = await findActiveSession(res);
    if (!session) return;

    const activeTerm = session.terms.find((term) => term.isActive);
    if (!activeTerm) {
      return handleError(res, "No active term found in the session", 400);
    }

    // Ensure the new session date is ahead of the current session date
    const currentEnrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId: studentId[0], classId: fromClassId },
      include: { session: true }, // Explicitly join session relation
      orderBy: { createdAt: "desc" },
    });

    if (
      currentEnrollment &&
      new Date(session.start_date) <=
        new Date(currentEnrollment.session?.start_date || "")
    ) {
      return handleError(
        res,
        "Promotion must be to a session ahead of the current session",
        400
      );
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
        data: studentId.map((id) => ({
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
        data: studentId.map((id) => ({
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

    // Validate existence of students
    const students = await prisma.student.findMany({
      where: { id: { in: studentId } },
    });
    if (students.length !== studentId.length) {
      handleError(res, "One or more students not found", 404);
    }

    // Validate existence of schools
    const schools = await prisma.school.findMany({
      where: { id: { in: [fromSchoolId, toSchoolId] } },
    });
    if (schools.length !== 2) {
      handleError(res, "One or both schools not found", 404);
    }

    // Perform transfer
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
      message: `${transfer.count} student(s) transferred successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Get Transfer Students by School
export const getTransferStudentsBySchool = async (
  req: Request<
    { schoolId: string },
    {},
    {},
    { fromSchoolId?: string; toSchoolId?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolId } = req.params;
    const { fromSchoolId, toSchoolId } = req.query;

    // Validate schoolId
    if (!schoolId || schoolId.trim() === "") {
      return handleError(res, "Valid School ID is required", 400);
    }

    // Validate optional filters
    if (fromSchoolId && typeof fromSchoolId !== "string") {
      return handleError(res, "Invalid fromSchoolId", 400);
    }
    if (toSchoolId && typeof toSchoolId !== "string") {
      return handleError(res, "Invalid toSchoolId", 400);
    }

    // Build query filters
    const filters: any = {
      OR: [{ fromSchoolId: schoolId }, { toSchoolId: schoolId }],
    };
    if (fromSchoolId) filters.AND = { fromSchoolId };
    if (toSchoolId) filters.AND = { ...(filters.AND || {}), toSchoolId };

    // Fetch transfer students
    const transfers = await prisma.studentTransfer.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Transfer students fetched successfully",
      data: { transfers, total: transfers.length },
    });
  } catch (error) {
    next(error);
  }
};
