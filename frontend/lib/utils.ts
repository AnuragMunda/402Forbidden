import { ArenaDetailsResponseObject, UserHistoryResponseObject } from "./types";

export function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export const parseArenaDetails = (arena: ArenaDetailsResponseObject) => {
  return {
    arenaId: arena.arenaId,
    difficulty: arena.difficulty,
    hint: arena.hint,
    category: arena.category,
  };
};

export const parseUserChats = (userHistory: UserHistoryResponseObject) => {
  const chatHistory = userHistory.chats.map((chat) => ({
    role: chat.role,
    content: chat.parts[0].text,
  }));

  return chatHistory;
};
