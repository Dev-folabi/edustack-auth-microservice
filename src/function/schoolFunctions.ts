import prisma from "../prisma";

export const validateSchool = async (schoolId: string) => {
  const existingSchool = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (existingSchool) {
    return existingSchool;
  }

  return null;
};

// Helper to validate user-school relationship
export const validateUserSchool = async (userId: string, schoolId: string) => {
  return prisma.userSchool.findUnique({
    where: { userId_schoolId: { userId, schoolId } },
  });
};
