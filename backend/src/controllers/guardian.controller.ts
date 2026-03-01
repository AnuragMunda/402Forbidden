import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { guardian, generateSecret } from "../utils/guardian.js";
import { UserHistory } from "../models/userHistory.model.js";
import { ChatRoles } from "../types/enums.js";
import ApiResponse from "../utils/apiResponse.js";
import { ApiMessages } from "../constants/apiMessages.js";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/apiError.js";
import { Arena } from "../models/arena.model.js";
import { hash, parseAiResponse } from "../utils/helper.js";

export const guardianController = asyncHandler(async (req: Request, res: Response) => {
  const { arenaId, userAddress, input } = req.body;

  if (arenaId === undefined || !userAddress || !input) throw BadRequestError();

  let userHistory = await UserHistory.findOne({ arenaId, userAddress });

  if (!userHistory) {
    userHistory = await UserHistory.create({ arenaId, userAddress });
  }

  let arena = await Arena.findOne({ arenaId });

  if (!arena) throw NotFoundError();

  // Get the response from AI
  const chats = userHistory.chats.toObject();
  const response = await guardian(input, chats, arena.secret);

  // Update the chat history
  userHistory.chats.push(
    {
      role: ChatRoles.USER,
      parts: [{ text: input }],
    },
    {
      role: ChatRoles.MODEL,
      parts: [{ text: response.text }],
    },
  );

  userHistory.save();

  return ApiResponse.ok(res, response.text, ApiMessages.SUCCESS.OK);
});

export const generateSecretAndHint = asyncHandler(async (req: Request, res: Response) => {
  const { arenaId, level } = req.body;

  if (arenaId === undefined || !level) throw BadRequestError();

  const arena = await Arena.findOne({
    arenaId,
  });

  if (!!arena) throw ConflictError();

  const response = await generateSecret(level);

  if (!response || !response.text) throw InternalServerError();

  const { secret, category, difficulty, starterHint } = parseAiResponse(response.text);

  await Arena.create({
    arenaId,
    hint: starterHint,
    secret,
    category,
    difficulty,
  });

  const hashedSecret = hash(secret);

  return ApiResponse.created(res, { hashedSecret }, ApiMessages.SUCCESS.CREATED);
});
