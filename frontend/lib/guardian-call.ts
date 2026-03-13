import { config } from "@/constants/constants";
import { Address } from "@solana/kit";
import axios from "axios";
import { ArenaDetailsResponseObject, UserHistoryResponseObject } from "./types";
import { parseArenaDetails, parseUserChats } from "./utils";

export const sendMessageToGuardian = async (
  arenaId: number,
  userAddress: Address,
  input: string,
) => {
  const response = await axios.post(config.GUARDIAN_API, {
    arenaId,
    userAddress,
    input,
  });
  console.log(response.data)
  return response.data.data;
};

export const getArenaDetails = async (id: number) => {
  const response = await axios.get(`${config.ARENA_API}/${id}`);
  const arenaDetails = parseArenaDetails(
    response.data.data as ArenaDetailsResponseObject,
  );
  return arenaDetails;
};

export const getUserChats = async (arenaId: number, userAddress: Address) => {
  const response = await axios.get(
    `${config.ARENA_API}/${arenaId}/${userAddress}`,
  );
  if (response.data.data.length === 0) return response.data.data;

  const userChats = parseUserChats(response.data.data as UserHistoryResponseObject);
  return userChats;
};
