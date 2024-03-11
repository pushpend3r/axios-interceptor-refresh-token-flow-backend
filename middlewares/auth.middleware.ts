import { NextFunction, Response, Request } from "express";
import { authService } from "../services/auth.service";
import { TokenPayload, TokenType } from "../types";
import * as jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization ?? "";

  try {
    authService.verifyToken(accessToken);
  } catch (error: any) {
    if (error?.message === "jwt expired") {
      return res.status(401).send("Access Token expired");
    }
    return res.status(401).send("Something went wrong");
  }

  const tokenPayload = authService.getTokenPayload(
    accessToken
  ) as TokenPayload & jwt.JwtPayload;

  if (tokenPayload.tokenType !== TokenType.ACCESS) {
    return res.status(400).send("Invalid token");
  }

  next();
};

export { authMiddleware };
