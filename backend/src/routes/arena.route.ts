import { Router } from "express";
import { getArenaDetails, getUserChats } from "../controllers/arena.controller.js";

const router: Router = Router();

router.route("/:id").get(getArenaDetails);
router.route("/:id/:userAddress").get(getUserChats);

export default router;
