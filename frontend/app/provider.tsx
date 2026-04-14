"use client"

import { SolanaProvider } from "@solana/react-hooks";
import { client } from "../lib/solana";

export function SolanaClientProvider({ children }: { children: React.ReactNode }) {
  return <SolanaProvider client={client}>{children}</SolanaProvider>;
}
