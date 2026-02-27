import express, { type Express } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import guardianRouter from "./routes/guardian.route.js";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/guardian", guardianRouter);

app.get("/", (req, res) => {
  res.send("Welcome to 402 Forbidden server");
});

app.use(errorMiddleware);

export default app;
