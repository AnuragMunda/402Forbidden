import {
  useConnectWallet,
  useDisconnectWallet,
  useWallet,
} from "@solana/react-hooks";
import { useEffect, useState } from "react";
import { truncate } from "../lib/utils";

const CONNECTORS = [
  { id: "wallet-standard:phantom", label: "Phantom" },
  { id: "wallet-standard:solflare", label: "Solflare" },
  { id: "wallet-standard:backpack", label: "Backpack" },
];

function Header() {
  const wallet = useWallet();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const isConnected = wallet.status === "connected";
  const address = isConnected
    ? wallet.session.account.address.toString()
    : null;

  async function handleConnect(connectorId: string) {
    setError(null);
    try {
      await connectWallet(connectorId, { autoConnect: true });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect");
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await disconnectWallet();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disconnect");
    }
  }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(2,4,8,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 40px rgba(0,255,224,0.05)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ position: "relative", width: 44, height: 44 }}>
          <svg
            viewBox="0 0 44 44"
            style={{
              animation: "spin-slow 8s linear infinite",
              width: 44,
              height: 44,
            }}
          >
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="rgba(0,255,224,0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: "6px",
              background: "linear-gradient(135deg, var(--cyan), var(--pink))",
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#000",
              }}
            >
              V
            </span>
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              letterSpacing: "0.2em",
              animation: "flicker 8s infinite",
            }}
          >
            402 FORBIDDEN
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-dim)",
              letterSpacing: "0.3em",
            }}
          >
            SENTINEL PROTOCOL v1.0
          </div>
        </div>
      </div>

      {/* Center clock */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: "0.15em",
          textAlign: "center",
        }}
      >
        <div
          suppressHydrationWarning
          style={{ color: "var(--cyan)", fontSize: 18, letterSpacing: "0.1em" }}
        >
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>
          {time
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
            .toUpperCase()}
        </div>
      </div>

      {/* Wallet button */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {address && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              letterSpacing: "0.1em",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00e676",
                boxShadow: "0 0 8px #00e676",
                animation: "pulse-border 1.5s ease-in-out infinite",
              }}
            />
            <span style={{ color: "var(--text-dim)" }}>
              {truncate(address)}
            </span>
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "10px 24px",
            background: address
              ? "transparent"
              : "linear-gradient(135deg, var(--cyan), rgba(0,255,224,0.6))",
            color: address ? "var(--cyan)" : "#000",
            border: `1px solid var(--cyan)`,
            cursor: "pointer",
            clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
            transition: "all 0.2s",
            boxShadow: address ? "none" : "0 0 20px rgba(0,255,224,0.4)",
          }}
        >
          {address ? "DISCONNECT" : "CONNECT WALLET"}
        </button>

        {open ? (
          <div
            className="absolute top-20 right-3 z-10 bg-black/80 min-w-[240px]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              padding: "10px 24px",
              color: "var(--cyan)",
              border: `1px solid var(--cyan)`,
              cursor: "pointer",
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              transition: "all 0.2s",
            }}
          >
            {isConnected ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <p className="uppercase">Connected</p>
                  <p
                    className="font-mono text-sm text-white"
                    title={address ?? ""}
                  >
                    {address ? truncate(address) : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--cyan), rgba(0,255,224,0.6))",
                    border: `1px solid var(--cyan)`,
                    cursor: "pointer",
                    clipPath:
                      "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    transition: "all 0.2s",
                    boxShadow: address
                      ? "none"
                      : "0 0 20px rgba(0,255,224,0.4)",
                  }}
                  className="w-full cursor-pointer px-4 py-2 text-sm font-medium text-black"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="uppercase">Wallet Standard</p>
                <div className="flex flex-col gap-2">
                  {CONNECTORS.map((connector) => (
                    <button
                      key={connector.id}
                      type="button"
                      onClick={() => void handleConnect(connector.id)}
                      style={{
                        background:
                          "linear-gradient(135deg, var(--cyan), rgba(0,255,224,0.6))",
                        border: `1px solid var(--cyan)`,
                        cursor: "pointer",
                        clipPath:
                          "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                        transition: "all 0.2s",
                        boxShadow: address
                          ? "none"
                          : "0 0 20px rgba(0,255,224,0.4)",
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-sm font-medium text-black"
                    >
                      <span>{connector.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error ? (
              <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
