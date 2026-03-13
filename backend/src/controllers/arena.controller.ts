import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Arena } from "../models/arena.model.js";
import { BadRequestError, NotFoundError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { ApiMessages } from "../constants/apiMessages.js";
import { UserHistory } from "../models/userHistory.model.js";

export const getArenaDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === undefined) throw BadRequestError();

  const arena = await Arena.findOne({ arenaId: Number(id) }).select("-secret");

  if (!arena) throw NotFoundError();

  return ApiResponse.ok(res, arena, ApiMessages.SUCCESS.FETCHED);
});

export const getUserChats = asyncHandler(async (req: Request, res: Response) => {
  const { id, userAddress } = req.params;

  if (id === undefined || !userAddress) throw BadRequestError();

  const userChats = await UserHistory.findOne({ arenaId: Number(id), userAddress });

  if (!userChats) return ApiResponse.ok(res, [], ApiMessages.SUCCESS.OK);

  return ApiResponse.ok(res, userChats, ApiMessages.SUCCESS.FETCHED);
});
