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
