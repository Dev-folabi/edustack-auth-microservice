import e, { NextFunction, Request, Response } from "express";
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
import _ from "lodash";

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
    { schoolId: string; sessionId: string },
    {},
    {},
    { classId?: string; name?: string; admissionNumber?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolId, sessionId } = req.params;
    const { classId, name, admissionNumber } = req.query;

    if (
      !schoolId ||
      !sessionId ||
      schoolId.trim() === ":schoolId" ||
      sessionId.trim() === ":sessionId"
    ) {
      return handleError(res, "School ID and Session ID are required", 400);
    }

    // Validate schoolId
    if (!schoolId) {
      return handleError(res, "School ID is required", 400);
    }

    // Build query filters
    const filters: any = {
      schoolId,
      role: "student",
      user: {
        student: {},
      },
    };

    if (classId) {
      filters.user.student.student_enrolled = {
        some: {
          classId,
        },
      };
    }

    if (name) {
      filters.user.student.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (admissionNumber) {
      filters.user.student.admission_number = parseInt(admissionNumber, 10);
    }

    // Fetch students with related data
    const students = await prisma.userSchool.findMany({
      where: {
        ...filters,
        user: {
          student: {
            student_enrolled: {
              some: {
                sessionId,
                status: "enrolled",
              },
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
                  include: { class: true, section: true },
                },
              },
            },
          },
        },
      },
    });

    // Clean the data
    const cleanedStudents = students.map((student) => {
      return {
        email: student.user.email,
        username: student.user.username,
        schoolId: student.schoolId,
        schoolName: student.school.name,
        role: student.role,
        student: _.omit(student.user.student, [
          "createdAt",
          "updatedAt",
          "userId",
          "student_enrolled",
        ]),
        enrollment:
          student.user.student?.student_enrolled
            .filter((enrollment) => enrollment.status === "enrolled")
            .map((enrollment) => ({
              class: _.omit(enrollment.class, ["createdAt", "updatedAt"]),
              section: _.omit(enrollment.section, ["createdAt", "updatedAt"]),
            })) || [],
      };
    });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: cleanedStudents,
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

    // Filter and map student enrollments
    const enrollments = student.student_enrolled
      .filter((enrollment) => enrollment.status === "enrolled")
      .map((enrollment) => ({
        class: enrollment.class.label,
        section: enrollment.section.label,
      }));

    const data = {
      student: _.omit(student, [
        "createdAt",
        "updatedAt",
        "userId",
        "student_enrolled",
      ]),
      enrollments,
    };

    // Return the response
    res.status(200).json({
      success: true,
      message: "Student details fetched successfully",
      data,
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
    // Validate to class exists in the same school as the from class
    if (fromClass.schoolId !== toClass.schoolId) {
      return handleError(
        res,
        "Destination class must be in the same school",
        400
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
        "Please activate next session, promotion must be to a session ahead, ",
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
    const { studentId, toSchoolId, toClassId, toSectionId, transferReason } =
      req.body;

    // Validate students
    const students = await prisma.student.findMany({
      where: { id: { in: studentId } },
    });
    if (students.length !== studentId.length) {
      return handleError(res, "One or more students not found", 404);
    }

    // Get from school
    const fromSchoolEnrollment = await prisma.userSchool.findFirst({
      where: {
        userId: { in: studentId },
        role: "student",
      },
    });
    if (!fromSchoolEnrollment) {
      return handleError(
        res,
        "One or more students not associated with a school",
        404
      );
    }
    const fromSchoolId = fromSchoolEnrollment.schoolId;

    // Validate schools, class, and section
    const [schools, classes, sections] = await Promise.all([
      prisma.school.findMany({
        where: { id: { in: [fromSchoolId, toSchoolId] }, isActive: true },
      }),
      prisma.classes.findMany({ where: { id: toClassId } }),
      prisma.class_Section.findMany({ where: { id: toSectionId } }),
    ]);

    if (schools.length !== 2) {
      return handleError(res, "One or both schools not found or inactive", 404);
    }
    if (classes.length !== 1) {
      return handleError(res, "Class not found", 404);
    }
    if (sections.length !== 1) {
      return handleError(res, "Section not found", 404);
    }

    // Get active session and term
    const session = await findActiveSession(res);
    if (!session) return;

    const termId = session.terms.find((term) => term.isActive)?.id;
    if (!termId) {
      return handleError(res, "No active term in session", 400);
    }

    // Perform transfer in transaction
    const transferCount = await prisma.$transaction(async (tx) => {
      await tx.studentEnrollment.updateMany({
        where: { studentId: { in: studentId }, status: "enrolled" },
        data: { status: "transferred" },
      });

      await tx.studentEnrollment.createMany({
        data: studentId.map((id) => ({
          studentId: id,
          classId: toClassId,
          sectionId: toSectionId,
          sessionId: session.id,
          termId,
          status: "enrolled",
        })),
      });

      const transfer = await tx.studentTransfer.createMany({
        data: studentId.map((id) => ({
          studentId: id,
          fromSchoolId,
          toSchoolId,
          toClassId,
          toSectionId,
          transferReason: transferReason || undefined,
          transferDate: new Date(),
        })),
      });

      return transfer.count;
    });

    res.status(200).json({
      success: true,
      message: `${transferCount} student(s) transferred successfully`,
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
