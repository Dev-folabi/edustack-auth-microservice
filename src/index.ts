import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import api from "./routes/api";
import prisma from "./prisma";
import { errorHandler } from "./error/errorHandler";
import "./function/cronJob";

const app = express();

const port = process.env.PORT || 7000;
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Edustack Auth Microservice");
});

app.use("/api", api);

app.use("*", (req, res) => {
  res.status(404).send({
    message: "Resource Not Found",
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  prisma.$disconnect();
  console.log("Prisma client disconnected");
  process.exit(0);
});
