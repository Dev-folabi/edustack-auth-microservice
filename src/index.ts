import express from "express";
import cors from "cors";
import morgan from "morgan";
import prisma from "./prisma";

const app = express();

const port = process.env.PORT || 6000;
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Edustack Auth Microservice");
});

app.use("/*", (req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  prisma.$disconnect();
  console.log("Prisma client disconnected");
  process.exit(0);
});

