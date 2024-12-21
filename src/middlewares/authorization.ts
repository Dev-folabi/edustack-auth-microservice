import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { getIdFromToken } from "../function/token";
import { UserRole as PrismaUserRole } from "@prisma/client";

export const role_authorization = (roles: PrismaUserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const ID = getIdFromToken(req.headers["authorization"] as string);
    if (!ID) {
      handleError(res, 400, "Invalid token provided");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: ID },
      select: {
        id: true,
        isSuperAdmin: true,
      },
    });

    if (!user) {
      handleError(res, 404, "User not found");
      return;
    }

    if (!user.isSuperAdmin && !(await hasAnyRole(user.id, roles))) {
      handleError(res, 403, "You are not authorized to perform this action");
      return;
    }

    next();
  };
};

export const token_authorization = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    handleError(res, 400, "Authorization header is missing");
    return;
  }

  const ID = getIdFromToken(authHeader as string);
  if (!ID) {
    handleError(res, 400, "Invalid token provided");
    return;
  }

  req.body.userId = ID;
  
  next();
};



const hasAnyRole = async (userId: string, roles: PrismaUserRole[]) => {
  const userRole = await prisma.userSchool.findUnique({
    where: { id: userId },
  });
  return userRole?.role.some(role => roles.includes(role));
};

const handleError = (res: Response, status: number, message: string) => {
  res.status(status).json({ success: false, message });
};
