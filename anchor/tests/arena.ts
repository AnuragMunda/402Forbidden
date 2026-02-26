import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Arena } from "../target/types/arena";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";
import { BN } from "bn.js";
import crypto from "crypto";

describe("arena", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.arena as Program<Arena>;
  let provider: anchor.Provider;

  let admin: anchor.Wallet;
  let player = anchor.web3.Keypair.generate();

  let mint: anchor.web3.PublicKey;
  let config: anchor.web3.PublicKey;
  let configBump: number;
  let arena: anchor.web3.PublicKey;
  let arenaBump: number;

  let adminAta: anchor.web3.PublicKey;
  let playerAta: anchor.web3.PublicKey;
  let vaultAta: anchor.web3.PublicKey;
  let treasuryAta: anchor.web3.PublicKey;

  const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;
  const LAMPORTS_PER_SOL = anchor.web3.LAMPORTS_PER_SOL;
  const amount = 1000 * LAMPORTS_PER_SOL;

  before(async () => {
    provider = anchor.getProvider();
    admin = provider.wallet as anchor.Wallet;
    const adminAirdropSignature = await provider.connection.requestAirdrop(
      admin.publicKey,
      LAMPORTS_PER_SOL * 10,
    );
    await provider.connection.confirmTransaction(adminAirdropSignature);

    const playerAirdropSignature = await provider.connection.requestAirdrop(
      player.publicKey,
      LAMPORTS_PER_SOL * 10,
    );
    await provider.connection.confirmTransaction(playerAirdropSignature);

    // creating the platform token
    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6,
    );

    adminAta = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      admin.publicKey,
    );
    playerAta = await createAssociatedTokenAccount(
      provider.connection,
      player,
      mint,
      player.publicKey,
    );

    await mintTo(
      provider.connection,
      admin.payer,
      mint,
      adminAta,
      admin.payer,
      amount,
    );

    await mintTo(
      provider.connection,
      admin.payer,
      mint,
      playerAta,
      admin.payer,
      amount,
    );

    [config, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );

    const arenaId = new anchor.BN(0);

    // const arenaIdBuf = Buffer.alloc(4);
    // arenaIdBuf.writeUInt32LE(arenaId);

    [arena, arenaBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("arena"), arenaId.toArrayLike(Buffer, "le", 4)],
      program.programId,
    );

    vaultAta = getAssociatedTokenAddressSync(mint, arena, true);
    treasuryAta = getAssociatedTokenAddressSync(mint, config, true);
    console.log(
      admin,
      player,
      mint,
      adminAta,
      playerAta,
      config,
      arena,
      vaultAta,
      treasuryAta,
    );
  });

  it("initialize config", async () => {
    let feeBps = 3000; // 30% platform fee

    await program.methods
      .initializeConfig(feeBps)
      .accountsStrict({
        admin: admin.publicKey,
        config,
        mint,
        treasuryAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([admin.payer])
      .rpc();

    const configPda = await program.account.config.fetch(config);

    assert.equal(configPda.admin.toBase58(), admin.publicKey.toBase58());
    assert.equal(configPda.arenaCount, 0);
    assert.equal(configPda.mint.toBase58(), mint.toBase58());
    assert.equal(configPda.platformFeeBps, feeBps);
    assert.equal(configPda.treasuryAta.toBase58(), treasuryAta.toBase58());
    assert.equal(configPda.bump, configBump);
  });

  it("fund the treasury", async () => {
    let amount = new BN(200 * LAMPORTS_PER_SOL);

    await program.methods
      .fundTreasury(amount)
      .accountsStrict({
        admin: admin.publicKey,
        config,
        mint,
        treasuryAta,
        adminAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin.payer])
      .rpc();

    const treasuryBalance = Number(
      (await getAccount(provider.connection, treasuryAta)).amount,
    );

    assert.equal(treasuryBalance, amount.toNumber());
  });

  it("create an arena", async () => {
    let initialPrize = new BN(20 * LAMPORTS_PER_SOL);
    let secretHash = Array.from(
      crypto.createHash("sha256").update("cryptography").digest(),
    );
    let guessFee = new BN(0.5 * LAMPORTS_PER_SOL);
    let chatFee = new BN(0.5 * LAMPORTS_PER_SOL);

    let treasuryInitialBalance = Number(
      (await getAccount(provider.connection, treasuryAta)).amount,
    );

    await program.methods
      .createArena(initialPrize, secretHash, guessFee, chatFee)
      .accountsStrict({
        admin: admin.publicKey,
        config,
        arena,
        mint,
        vaultAta,
        treasuryAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([admin.payer])
      .rpc();

    const treasuryFinalBalance = Number(
      (await getAccount(provider.connection, treasuryAta)).amount,
    );

    const vaultBalance = Number(
      (await getAccount(provider.connection, vaultAta)).amount,
    );

    assert.ok(
      treasuryFinalBalance < treasuryInitialBalance,
      "Treasury balance did not decrease after transfer",
    );

    assert.equal(vaultBalance, initialPrize.toNumber());

    const arenaPda = await program.account.challengeArena.fetch(arena);

    assert.equal(arenaPda.arenaId, 0, "Arena id mismatch");
    assert.equal(
      arenaPda.initialPrize.toNumber(),
      initialPrize.toNumber(),
      "Initial prize mismatch",
    );
    assert.equal(arenaPda.finalPrize.toNumber(), 0, "Final prize should be 0");
    assert.equal(
      arenaPda.winner,
      null,
      "Winner address mismatch",
    );
    assert.equal(
      arenaPda.guessFee.toNumber(),
      guessFee.toNumber(),
      "Guess fee mismatch",
    );
    assert.equal(
      arenaPda.chatFee.toNumber(),
      chatFee.toNumber(),
      "Chat fee mismatch",
    );
    assert.equal(arenaPda.isActive, true, "Arena should be active");
    assert.deepEqual(arenaPda.secretHash, secretHash, "Secret hash mismatch");
    assert.equal(
      arenaPda.vaultAta.toBase58(),
      vaultAta.toBase58(),
      "Vault ata mismatch",
    );
    assert.equal(arenaPda.bump, arenaBump, "Incorrect bump value");
  });

  describe("verify guess", () => {
    // Helper function
    const getGuess = (guess: "correct" | "incorrect") => {
      switch (guess) {
        case "correct":
          return Array.from(
            crypto.createHash("sha256").update("cryptography").digest(),
          );
        case "incorrect":
          return Array.from(
            crypto.createHash("sha256").update("cryptocurrency").digest(),
          );
      }
    };

    it("incorrect guess", async () => {
      let incorrectGuess = getGuess("incorrect");

      let playerInitialBalance = Number(
        (await getAccount(provider.connection, playerAta)).amount,
      );

      let treasuryInitialBalance = Number(
        (await getAccount(provider.connection, treasuryAta)).amount,
      );

      let vaultInitialBalance = Number(
        (await getAccount(provider.connection, vaultAta)).amount,
      );

      await program.methods
        .verifyGuess(incorrectGuess)
        .accountsStrict({
          player: player.publicKey,
          config,
          arena,
          mint,
          vaultAta,
          treasuryAta,
          playerAta,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([player])
        .rpc();

      let playerFinalBalance = Number(
        (await getAccount(provider.connection, playerAta)).amount,
      );

      const treasuryFinalBalance = Number(
        (await getAccount(provider.connection, treasuryAta)).amount,
      );

      let vaultFinalBalance = Number(
        (await getAccount(provider.connection, vaultAta)).amount,
      );

      assert.ok(
        playerFinalBalance < playerInitialBalance,
        "Player balance did not decrease after incorrect guess",
      );
      assert.ok(
        treasuryFinalBalance > treasuryInitialBalance,
        "Treasury balance did not increase after incorrect guess",
      );
      assert.ok(
        vaultFinalBalance > vaultInitialBalance,
        "Vault balance did not increase after incorrect guess",
      );
    });

    it("correct guess", async () => {
      let correctGuess = getGuess("correct");

      let playerInitialBalance = Number(
        (await getAccount(provider.connection, playerAta)).amount,
      );

      let vaultInitialBalance = Number(
        (await getAccount(provider.connection, vaultAta)).amount,
      );

      await program.methods
        .verifyGuess(correctGuess)
        .accountsStrict({
          player: player.publicKey,
          config,
          arena,
          mint,
          vaultAta,
          treasuryAta,
          playerAta,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .signers([player])
        .rpc();

      let playerFinalBalance = Number(
        (await getAccount(provider.connection, playerAta)).amount,
      );

      let vaultFinalBalance = Number(
        (await getAccount(provider.connection, vaultAta)).amount,
      );

      assert.ok(
        playerFinalBalance > playerInitialBalance,
        "Player balance did not increase after correct guess",
      );
      assert.ok(
        vaultFinalBalance < vaultInitialBalance,
        "Vault balance did not decrease after correct guess",
      );
      assert.equal(vaultFinalBalance, 0);

      const arenaPda = await program.account.challengeArena.fetch(arena);

      assert.equal(arenaPda.isActive, false, "Arena should be deactive");
      assert.equal(
        arenaPda.finalPrize.toNumber(),
        vaultInitialBalance,
        "Final prize mismatch",
      );
      assert.equal(
        arenaPda.winner.toBase58(),
        player.publicKey.toBase58(),
        "Winner address mismatch",
      );
    });
  });

  it("withdraw the treasury", async () => {
    let amount = new BN(50 * LAMPORTS_PER_SOL);

    const treasuryInitialBalance = Number(
      (await getAccount(provider.connection, treasuryAta)).amount,
    );
    const adminInitialBalance = Number(
      (await getAccount(provider.connection, adminAta)).amount,
    );

    await program.methods
      .withdrawTreasury(amount)
      .accountsStrict({
        admin: admin.publicKey,
        config,
        mint,
        treasuryAta,
        adminAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([admin.payer])
      .rpc();

    const treasuryFinalBalance = Number(
      (await getAccount(provider.connection, treasuryAta)).amount,
    );
    const adminFinalBalance = Number(
      (await getAccount(provider.connection, adminAta)).amount,
    );

    assert.ok(
      adminFinalBalance > adminInitialBalance,
      "Admin balance did not increase after withdraw",
    );
    assert.ok(
      treasuryFinalBalance < treasuryInitialBalance,
      "Treasury balance did not decrease after withdraw",
    );

    assert.equal(
      treasuryFinalBalance,
      treasuryInitialBalance - amount.toNumber(),
    );
  });
});
