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
  fixCodecSize,
  getU8Codec,
  getArrayCodec,
} from "@solana/kit";

import IDL from "@/constants/arena.json";
import { BN } from "@coral-xyz/anchor";
import { config } from "@/constants/constants";

const PROGRAM_ID = address(IDL.address) as Address;
const rpc = createSolanaRpc(config.SOLANA_DEVNET_URL);

export const getConfig = async () => {
  const [configPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: ["config"],
  });

  const account = await rpc.getAccountInfo(configPda).send();
  return account;
};

export const getArena = async (id: number) => {
  const arenaPda = await getArenaPda(id);
  const account = await rpc.getAccountInfo(arenaPda).send();
  return account;
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
  const areanas = decodedArenas.filter((arena) => arena !== null).sort((a, b) => a.data.arenaId - b.data.arenaId);
  return areanas;
};

const getArenaPda = async (id: number) => {
  const arenaId = new BN(id);

  const [arenaPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [Buffer.from("arena"), arenaId.toArrayLike(Buffer, "le", 4)],
  });

  return arenaPda as Address;
};
