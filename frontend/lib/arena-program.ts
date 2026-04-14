import {
  getProgramDerivedAddress,
  address,
  type Address,
  createSolanaRpc,
  getStructCodec,
  getU32Codec,
  getOptionCodec,
  getAddressCodec,
  getU64Codec,
  getBooleanCodec,
  getBase58Codec,
  Base58EncodedBytes,
  getBase64Codec,
  getU8Codec,
  getArrayCodec,
  createNoopSigner,
} from "@solana/kit";

import IDL from "@/constants/arena.json";
import { BN } from "@coral-xyz/anchor";
import { config, MINT_ADDRESS } from "@/constants";
import { getVerifyGuessInstructionDataEncoder } from "@/generated/arena/src/generated";
import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { ArenaAccount } from "./types";

const PROGRAM_ID = address(IDL.address) as Address;
const rpc = createSolanaRpc(config.SOLANA_DEVNET_URL);

const getConfigPda = async () => {
  const [configPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: ["config"],
  });

  return configPda;
};

export const getArena = async (id: number) => {
  const arenaPda = await getArenaPda(id);
  const account = await rpc.getAccountInfo(arenaPda, { encoding: "base64"}).send() as ArenaAccount;
  console.log(account);
  const challengeArenaCodec = getStructCodec([
    ["discriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["arenaId", getU32Codec()],
    ["winner", getOptionCodec(getAddressCodec())],
    ["initialPrize", getU64Codec()],
    ["finalPrize", getU64Codec()],
    ["secretHash", getArrayCodec(getU8Codec(), { size: 32 })],
    ["vaultAta", getAddressCodec()],
    ["guessFee", getU64Codec()],
    ["chatFee", getU64Codec()],
    ["isActive", getBooleanCodec()],
    ["bump", getU8Codec()],
  ]);

  try {
    // Access the raw data from the account
    const base64 = getBase64Codec();
    const rawData = account.value.data[0];

    // Decode using our defined codec
    const decoded = challengeArenaCodec.decode(base64.encode(rawData));

    return decoded;
  } catch (e) {
    console.error(`Failed to decode account`, e);
    return null;
  }
};

export const getAllArenas = async () => {
  const discriminatorBytes = new Uint8Array(config.ARENA_DISCRIMINATOR);
  const base58Discriminator = getBase58Codec().decode(discriminatorBytes);
  const accounts = await rpc
    .getProgramAccounts(PROGRAM_ID, {
      encoding: "base64",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: base58Discriminator as Base58EncodedBytes,
            encoding: "base58",
          },
        },
      ],
    })
    .send();

  const challengeArenaCodec = getStructCodec([
    ["discriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["arenaId", getU32Codec()],
    ["winner", getOptionCodec(getAddressCodec())],
    ["initialPrize", getU64Codec()],
    ["finalPrize", getU64Codec()],
    ["secretHash", getArrayCodec(getU8Codec(), { size: 32 })],
    ["vaultAta", getAddressCodec()],
    ["guessFee", getU64Codec()],
    ["chatFee", getU64Codec()],
    ["isActive", getBooleanCodec()],
    ["bump", getU8Codec()],
  ]);

  const decodedArenas = accounts
    .map((account) => {
      try {
        // Access the raw data from the account
        const base64 = getBase64Codec();
        const rawData = account.account.data[0];

        // Decode using our defined codec
        const decoded = challengeArenaCodec.decode(base64.encode(rawData));

        return {
          pubkey: account.pubkey,
          data: decoded,
        };
      } catch (e) {
        console.error(`Failed to decode account ${account.pubkey}:`, e);
        return null;
      }
    })
    .filter(Boolean);
  const areanas = decodedArenas
    .filter((arena) => arena !== null)
    .sort((a, b) => a.data.arenaId - b.data.arenaId);
  return areanas;
};

export const getArenaPda = async (id: number) => {
  const arenaId = new BN(id);

  const [arenaPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [Buffer.from("arena"), arenaId.toArrayLike(Buffer, "le", 4)],
  });

  return arenaPda as Address;
};

export const getArenaDetails = async (id: number) => {
  const arenaPda = await getArenaPda(id);
};

export const getVerifyGuessInstruction = async (
  player: Address,
  arenaId: number,
  hashedGuess: number[],
) => {
  const configPda = await getConfigPda();
  const arenaPda = await getArenaPda(arenaId);

  const verifyGuessDataEncoder = getVerifyGuessInstructionDataEncoder();
  const instructionData = verifyGuessDataEncoder.encode({
    hashedGuess: new Uint8Array(hashedGuess),
  });

  const [vaultAta] = await findAssociatedTokenPda({
    mint: MINT_ADDRESS,
    owner: arenaPda,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [treasuryAta] = await findAssociatedTokenPda({
    mint: MINT_ADDRESS,
    owner: configPda,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [playerAta] = await findAssociatedTokenPda({
    mint: MINT_ADDRESS,
    owner: player,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const verifyGuessInstruction = {
    programAddress: PROGRAM_ID,
    accounts: [
      { address: player, role: 3 },
      { address: configPda, role: 1 },
      { address: arenaPda, role: 1 },
      { address: MINT_ADDRESS, role: 0 },
      { address: vaultAta, role: 1 },
      { address: treasuryAta, role: 1 },
      { address: playerAta, role: 1 },
      { address: ASSOCIATED_TOKEN_PROGRAM_ADDRESS, role: 0 },
      { address: TOKEN_PROGRAM_ADDRESS, role: 0 },
      { address: SYSTEM_PROGRAM_ADDRESS, role: 0 },
    ],
    data: instructionData,
  };

  return verifyGuessInstruction;
};
