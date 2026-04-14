import { config } from "@/constants";
import { autoDiscover, createClient } from "@solana/client";
import { createSolanaRpc } from "@solana/kit";

export const client = createClient({
  cluster: "devnet",
  walletConnectors: autoDiscover(),
});
