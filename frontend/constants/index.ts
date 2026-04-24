import { address, Address } from "@solana/kit";
console.log(process.env.NEXT_PUBLIC_BACKEND_BASE_URL)
export const config = {
  SOLANA_DEVNET_URL:
    process.env.NEXT_PUBLIC_SOLANA_DEVNET_URL ||
    "https://api.devnet.solana.com",
  GUARDIAN_API: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000"}/guardian`,
  ARENA_API: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000"}/arena`,
  ARENA_DISCRIMINATOR: [110, 138, 16, 115, 180, 159, 158, 147],
  CONFIG_DISCRIMINATOR: [155, 12, 170, 224, 30, 250, 204, 130],
} as const;

export const initialIntro = `
A hidden truth lies within. You’ve already received your initial hint — use it wisely.

You may question me to narrow your path, but each message requires a small payment. Choose your words carefully.

Begin your interrogation... if you dare.
`.trim();

export const MINT_ADDRESS =
  address("D6tCeapwLY9ymPW1TaMcG6Wc83E3PtqkAjDzTNtwWnjw") as Address;

export const ARENAS_STATIC = [
  {
    id: 0,
    name: "SENTINEL ZERO",
    subtitle: "Vault Alpha · Tier I",
    difficulty: 1,
    color: "#00ffe0",
    guardian: "ARIA-01",
  },
  {
    id: 1,
    name: "PHANTOM GRID",
    subtitle: "Vault Beta · Tier II",
    difficulty: 2,
    color: "#ff3cac",
    guardian: "NEXUS-7",
  },
  {
    id: 2,
    name: "IRON ORACLE",
    subtitle: "Vault Gamma · Tier III",
    difficulty: 3,
    color: "#f9a825",
    guardian: "ORACLE-X",
  },
  {
    id: 3,
    name: "VOID ENGINE",
    subtitle: "Vault Delta · Tier IV",
    difficulty: 4,
    color: "#7c4dff",
    guardian: "VOID-∞",
  },
  {
    id: 4,
    name: "APEX CITADEL",
    subtitle: "Vault Omega · Tier V",
    difficulty: 5,
    color: "#ff6b35",
    guardian: "APEX-PRIME",
  },
  {
    id: 5,
    name: "DEEP CIPHER",
    subtitle: "Vault Sigma · Tier VI",
    difficulty: 6,
    color: "#00e676",
    guardian: "CIPHER-9",
  },
];
