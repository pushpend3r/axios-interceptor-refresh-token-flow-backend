import express from "express";
import bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import cors from "cors";
import "dotenv/config";

import { authMiddleware } from "./middlewares/auth.middleware";
import {
  AccessTokenBody,
  LoginRequestBody,
  SignUpRequestBody,
  TokenPayload,
  TokenType,
} from "./types";
import { authService } from "./services/auth.service";
import { db } from "./db";

const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Protected Routes
app.get("/posts", authMiddleware, async (req, res) => {
  const postsResponse = await axiosInstance.get("/posts");
  res.send(postsResponse.data.slice(0, 5));
});
app.get("/todos", authMiddleware, async (req, res) => {
  const todosResponse = await axiosInstance.get("/todos");
  res.send(todosResponse.data.slice(0, 5));
});
app.get("/users", authMiddleware, async (req, res) => {
  const usersResponse = await axiosInstance.get("/users");
  res.send(usersResponse.data.splice(0, 5));
});

// Public Routes
app.post("/login", async (req, res) => {
  // assuming body has required data
  const body: LoginRequestBody = req.body;

  const user = db.users.find((item) => item.email === body?.email);

  if (!user) {
    return res.status(400).send("User doesn't exist");
  }

  if (user.password !== body.password) {
    return res.send("Password doesn't match");
  }

  const { id, email, name } = user;

  const accessTokenPayload = {
    id,
    email,
    name,
    tokenType: TokenType.ACCESS,
  };

  const refreshTokenPayload = {
    id,
    email,
    name,
    tokenType: TokenType.REFRESH,
  };

  return res.status(200).send({
    accessToken: authService.generateAccessToken(accessTokenPayload),
    refreshToken: authService.generateRefreshToken(refreshTokenPayload),
  });
});
app.post("/sign-up", async (req, res) => {
  // assuming body has required data
  const body: SignUpRequestBody = req.body;

  // Note: Hash the password before storing it in DB
  // I did not do it for the sake of simplicity

  if (db.users.find((item) => item.email === body.email)) {
    return res.status(400).send("User already exist, try login");
  }

  db.users.push({
    id: db.users.length,
    ...body,
  });

  res.status(201).send("/sign-up");
});
app.post("/access-token", async (req, res) => {
  // assuming body has required data
  const body: AccessTokenBody = req.body;

  try {
    authService.verifyToken(body.refreshToken);
  } catch (error: any) {
    if (error?.message === "jwt expired") {
      return res.status(400).send("Refresh Token expired");
    }
    return res.status(400).send("Something went wrong");
  }

  const tokenPayload = authService.getTokenPayload(
    body.refreshToken
  ) as TokenPayload & jwt.JwtPayload;

  if (tokenPayload.tokenType !== TokenType.REFRESH) {
    return res.status(400).send("Invalid token");
  }

  const user = db.users.find((item) => item.id === tokenPayload.id);

  if (!user) {
    return res.status(404).send("User doesn't exist");
  }

  const { id, email, name } = user;

  const accessTokenPayload: TokenPayload = {
    id,
    email,
    name,
    tokenType: TokenType.ACCESS,
  };

  const refreshTokenPayload: TokenPayload = {
    id,
    email,
    name,
    tokenType: TokenType.REFRESH,
  };

  return res.status(200).send({
    accessToken: authService.generateAccessToken(accessTokenPayload),
    refreshToken: authService.generateRefreshToken(refreshTokenPayload),
  });
});

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});
