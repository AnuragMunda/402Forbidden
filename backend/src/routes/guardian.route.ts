import { Router } from "express";
import { generateSecretAndHint, guardianController } from "../controllers/guardian.controller.js";

const router: Router = Router();

router.route("/").post(guardianController);
router.route("/generateSecret").post(generateSecretAndHint);

export default router;
