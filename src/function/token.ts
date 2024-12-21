import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const decodeToken = (token: string): string => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
    return decoded.id;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const getIdFromToken = (authHeader?: string): string => {
  try {
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid authorization header format");
    }

    const token = parts[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
    return decoded.id;
  } catch (error : any) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};
