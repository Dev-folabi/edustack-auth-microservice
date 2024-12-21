import prisma from "../prisma";

export const getSchool = async (schoolId: string) => {
  const existingSchool = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (existingSchool) {
    return existingSchool;
  }

  return null;
};
