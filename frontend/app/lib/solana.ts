import { autoDiscover, createClient } from "@solana/client";

export const client = createClient({
  cluster: "devnet",
  walletConnectors: autoDiscover(),
});
