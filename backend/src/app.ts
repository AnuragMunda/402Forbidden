import express, { type Express } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import guardianRouter from "./routes/guardian.route.js";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator } from "@payai/facilitator";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const app: Express = express();

app.use(cors());
app.use(express.json());

const adminAddress = process.env.ADMIN_ADDRESS;

if (!adminAddress) {
  console.error("Missing admin address");
  process.exit(1);
}

const facilitatorClient = new HTTPFacilitatorClient(facilitator);

app.use(
  paymentMiddleware(
    {
      "POST /guardian": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.2",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: adminAddress,
          },
        ],
        description: "Access to chat with guardian",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient).register(
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      new ExactSvmScheme(),
    ),
  ),
);

app.use("/guardian", guardianRouter);

app.get("/", (req, res) => {
  res.send("Welcome to 402 Forbidden server");
});

app.use(errorMiddleware);

export default app;
