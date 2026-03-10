"use client";

import { useEffect, useState } from "react";
import ScanlineOverlay from "../components/scanline-overlay";
import Header from "../components/header";
import ArenaView from "../components/arena-view";
import GridBackground from "../components/grid-background";
import ArenaCard from "../components/arena-card";
import { useWallet } from "@solana/react-hooks";
import { getAllArenas } from "@/lib/arena-program";
import { Address, Option } from "@solana/kit";
import { ARENAS_STATIC } from "@/constants/constants";
import { Arena } from "@/lib/types";

export default function Home() {
  const { status } = useWallet();
  const [activeArena, setActiveArena] = useState<Arena | null>(null);
  const [arenas, setArenas] = useState<
    {
      pubkey: Address;
      data: Arena;
    }[]
  >([]);

  useEffect(() => {
    const getArenas = async () => {
      const arenas = await getAllArenas();
      console.log(arenas);
      setArenas(arenas);
    };

    getArenas();
  }, []);

  return (
    <>
      <ScanlineOverlay />
      <GridBackground />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Header />

        {activeArena ? (
          <ArenaView arena={activeArena} onBack={() => setActiveArena(null)} />
        ) : (
          <main
            style={{ padding: "48px 32px", maxWidth: 1400, margin: "0 auto" }}
          >
            {/* Page title */}
            <div style={{ marginBottom: 48, animation: "reveal 0.6s ease" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--cyan)",
                  letterSpacing: "0.4em",
                  marginBottom: 12,
                }}
              >
                ▸ SENTINEL PROTOCOL — ACTIVE
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(28px, 4vw, 52px)",
                  color: "#fff",
                  letterSpacing: "0.1em",
                  lineHeight: 1.1,
                }}
              >
                ARENA{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, var(--cyan), var(--pink))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  VAULTS
                </span>
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 17,
                  color: "var(--text-dim)",
                  marginTop: 12,
                  maxWidth: 550,
                  lineHeight: 1.6,
                }}
              >
                Each arena harbors a sentient AI guardian protecting a hidden
                vault. Connect your wallet, engage the guardian, decrypt its
                riddles, and crack the vault.
              </p>
            </div>

            {/* Wallet warning banner */}
            {status !== "connected" && (
              <div
                style={{
                  border: "1px solid rgba(255,60,172,0.4)",
                  background: "rgba(255,60,172,0.05)",
                  padding: "14px 20px",
                  marginBottom: 32,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: "reveal 0.8s ease",
                  clipPath:
                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "rgba(255,60,172,0.8)",
                    letterSpacing: "0.15em",
                  }}
                >
                  WALLET NOT CONNECTED — All arenas are locked. Connect your
                  wallet to begin infiltration.
                </span>
              </div>
            )}

            {/* Arena grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
              }}
            >
              {arenas.map((arena) => (
                <ArenaCard
                  key={arena.pubkey}
                  arena={arena.data}
                  walletConnected={status === "connected"}
                  onOpen={setActiveArena}
                />
              ))}
            </div>

            {/* Footer stats */}
            <div
              style={{
                marginTop: 64,
                paddingTop: 32,
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: 40,
                flexWrap: "wrap",
                animation: "reveal 1s ease",
              }}
            >
              {[
                { label: "TOTAL ARENAS", value: ARENAS_STATIC.length },
                {
                  label: "VAULTS COMPROMISED",
                  value: arenas.filter((a) => a.data.isActive === false)
                    .length,
                },
                { label: "ACTIVE GUARDIANS", value: arenas.length },
                { label: "PROTOCOL VERSION", value: "v1.0" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-dim)",
                      letterSpacing: "0.3em",
                      marginBottom: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 24,
                      color: "var(--cyan)",
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>
    </>
  );
}
