# 402 Forbidden

AI-powered, on-chain guessing game built on Solana.

Players interact with a futuristic AI Guardian to uncover a hidden
secret. Correct guesses unlock a token vault. Incorrect guesses fund the
prize pool and platform treasury.

------------------------------------------------------------------------

## Overview

402 Forbidden combines:

-   AI-driven hints and interactive chat
-   On-chain secret verification
-   Token-based game economy
-   Trustless prize payouts

The AI enhances gameplay. The blockchain enforces truth.

------------------------------------------------------------------------

## Architecture

User -\> Frontend -\> Backend (AI + Orchestrator) -\> AI Provider -\>
Solana Program

### On-Chain (Solana / Anchor)

-   config PDA
-   arena PDA
-   secret_hash
-   vault_ata
-   treasury_ata
-   Fee logic and prize payout

### Off-Chain

-   Plaintext secret storage
-   AI session handling
-   Guess hashing
-   On-chain transaction execution

------------------------------------------------------------------------

## Game Flow

1.  Admin creates Arena
    -   Secret is hashed (SHA-256)\
    -   Initial prize funded\
    -   Arena activated
2.  Player interacts
    -   Receives starter hint\
    -   Chats with AI (paid)\
    -   Submits guesses
3.  Verification
    -   Backend hashes guess\
    -   Smart contract compares hashes\
    -   If correct: vault pays winner\
    -   If incorrect: fee split between vault and treasury

------------------------------------------------------------------------

## Token Economics

Each Arena defines:

-   initial_prize
-   guess_fee
-   hint_fee
-   platform_fee_bps

Wrong guess distribution:

platform_fee = guess_fee \* bps / 10_000\
vault_share = guess_fee - platform_fee

This increases the prize pool over time.

------------------------------------------------------------------------

## Security Model

-   Only secret_hash stored on-chain
-   Plaintext secret stored securely off-chain
-   AI never controls funds
-   Blockchain verifies winners deterministically

Trustless payouts. Engaging AI layer.

------------------------------------------------------------------------

## Tech Stack

-   Solana
-   Anchor
-   SPL Token
-   TypeScript
-   Node.js
-   AI Provider (LLM)
-   React / Next.js

------------------------------------------------------------------------

## Development

Start validator:

solana-test-validator

Build:

anchor build

Deploy:

anchor deploy

Test:

anchor test

------------------------------------------------------------------------

## Vision

402 Forbidden explores the intersection of:

-   AI interaction
-   Cryptographic fairness
-   Strategic game economies
-   On-chain incentives

The Guardian protects knowledge. The chain protects value.
