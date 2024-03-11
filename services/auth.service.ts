import * as jwt from "jsonwebtoken";
import { TokenPayload } from "../types";

const jwtSecretKey = process.env.JWT_SECRET_KEY!;

const generateJwt = (payload: any, expiresIn: jwt.SignOptions["expiresIn"]) => {
  return jwt.sign(payload, jwtSecretKey, { expiresIn });
};

const generateAccessToken = (payload: TokenPayload) =>
  generateJwt(payload, "30s");
const generateRefreshToken = (payload: TokenPayload) =>
  generateJwt(payload, "1m");

const verifyToken = (token: string) => jwt.verify(token, jwtSecretKey);
const getTokenPayload = (token: string) => jwt.decode(token);

const authService = {
  generateRefreshToken,
  generateAccessToken,
  verifyToken,
  getTokenPayload,
};

export { authService };
