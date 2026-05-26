import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";



 interface IUser extends Document {
  _id:string;
  name: string;
  email: string;
  image: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  bio?: string;
}


export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No auth header",
      });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token){
      res.status(401).json({
        message: "Please Login - Token missing",
      });
      return;
    }
    const jwtSecret = process.env.JWT_SEC;
    if (!jwtSecret) {
      res.status(500).json({
        message: "JWT secret is not configured",
      });
      return;
    }
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded ) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("JWT verification error:", error);
    res.status(401).json({
      message: "Please Login - Jwt error",
    });
  }
};