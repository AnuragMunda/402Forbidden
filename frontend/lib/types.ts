import { Address, Option } from "@solana/kit";
import { Dispatch, SetStateAction } from "react";

export interface Arena {
  arenaId: number;
  finalPrize: bigint;
  vaultAta: Address<string>;
  guessFee: bigint;
  chatFee: bigint;
  initialPrize: bigint;
  winner: Option<Address<string>>;
  isActive: boolean;
}

export interface ArenaCardParams {
  arena: Arena;
  walletConnected: boolean;
  onOpen: Dispatch<SetStateAction<Arena | null>>;
}

export interface ArenaViewParams {
  arena: Arena;
  onBack: () => void;
}

export interface ArenaDetailsResponseObject {
  arenaId: number;
  difficulty: number;
  hint: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

export interface ArenaDetails {
  arenaId: number;
  difficulty: number;
  hint: string;
  category: string;
}

export interface UserHistoryResponseObject {
  arenaId: number;
  userAddress: Address;
  chats: [
    {
      role: string;
      parts: [{ text: string }];
      _id: string;
    },
  ];
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

export interface UserChats {
  role: string;
  content: string;
}
