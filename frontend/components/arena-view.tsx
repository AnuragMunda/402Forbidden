import { useEffect, useRef, useState } from "react";
import ChatMessage from "./chat-message";
import { ArenaDetails, ArenaViewParams, UserChats } from "@/lib/types";
import { ARENAS_STATIC, initialIntro, MINT_ADDRESS } from "@/constants";
import {
  getArenaDetails,
  getUserChats,
  sendMessageToGuardian,
} from "@/lib/guardian-call";
import {
  useSendTransaction,
  useSplToken,
  useWallet,
} from "@solana/react-hooks";
import {
  getArena,
  getArenaPda,
  getVerifyGuessInstruction,
} from "@/lib/arena-program";
import crypto from "crypto";

function ArenaView({ arena, onBack }: ArenaViewParams) {
  const wallet = useWallet();
  const { send } = useSendTransaction();
  const [arenaPda, setArenaPda] = useState<string | null>(null);

  const { balance } = useSplToken(MINT_ADDRESS, {
    owner: arenaPda || undefined,
  });

  const isConnected = wallet.status === "connected";
  const address = isConnected ? wallet.session.account.address : null;

  const arenaMetadata = ARENAS_STATIC.find((a) => a.id === arena.arenaId);

    if (!address || !isConnected || !arenaMetadata) onBack();

  const [chats, setChats] = useState<UserChats[]>([
    {
      role: "model",
      content: `
      SENTINEL ACTIVATED.

      Welcome, challenger. I am ${arenaMetadata?.guardian}, guardian of ${arenaMetadata?.name}.\n
      ${initialIntro}
      `,
    },
  ]);
  const [arenaDetails, setArenaDetails] = useState<ArenaDetails | null>();
  const [inputVal, setInputVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [vaultStatus, setVaultStatus] = useState("locked"); // locked | shaking | cracked
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getAndSetArenaDetails = async () => {
      const arenaDetails = await getArenaDetails(arena.arenaId);
      setArenaDetails(arenaDetails);
    };

    getAndSetArenaDetails();
  }, []);

  useEffect(() => {
    const fetchArenaPda = async () => {
      const pda = await getArenaPda(arena.arenaId);
      setArenaPda(pda);
    };
    fetchArenaPda();
  }, [arena.arenaId]);

  useEffect(() => {
    if (!address) return;
    const getAndSetUserChats = async () => {
      const userChats = await getUserChats(arena.arenaId, address);
      if (userChats.length !== 0) setChats([...chats, ...userChats]);
    };

    getAndSetUserChats();
  }, []);

   useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async () => {
    if (!inputVal.trim() || loading || !address) return;
    const userMsg = inputVal.trim();
    setInputVal("");
    setChats((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const reply = await sendMessageToGuardian(
        arena.arenaId,
        address,
        inputVal,
      );
      setChats((prev) => [...prev, { role: "model", content: reply }]);
    } catch {
      setChats((prev) => [
        ...prev,
        {
          role: "model",
          content: "CONNECTION INTERRUPTED. Try again, intruder.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const verifyGuess = async () => {
    if (!passwordVal.trim() || !address) return;

    const hashedGuess = Array.from(
      crypto.createHash("sha256").update(passwordVal.trim()).digest(),
    );
    const ix = await getVerifyGuessInstruction(
      address,
      arena.arenaId,
      hashedGuess,
    );

    try {
      await send({
        instructions: [ix],
        commitment: "confirmed",
      });

      const arenaInfo = await getArena(arena.arenaId);

      if (arenaInfo?.winner.__option === "None") {
        setVaultStatus("shaking");
        setTimeout(() => setVaultStatus("locked"), 600);
        setChats((prev) => [
          ...prev,
          {
            role: "model",
            content:
              "INCORRECT. The vault rejects you. Do you think brute force will work against me? Think deeper, mortal.",
          },
        ]);
      } else {
        setVaultStatus("cracked");
      }
    } catch (error) {
      console.error(error);
      setChats((prev) => [
        ...prev,
        {
          role: "model",
          content: "CONNECTION INTERRUPED. Something went wrong. Try again.",
        },
      ]);
    } finally {
      setPasswordVal("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, ${arenaMetadata?.color}08 0%, var(--bg) 60%)`,
        animation: "reveal 0.5s ease",
      }}
    >
      {/* Arena header */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: "rgba(2,4,8,0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => {
            onBack();
            window.scrollTo({
              top: 0,
              behavior: "auto",
            });
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.15em",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            padding: "8px 16px",
            cursor: "pointer",
            clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            arenaMetadata ? (e.target as HTMLButtonElement).style.borderColor = arenaMetadata.color : "";
            arenaMetadata ? (e.target as HTMLButtonElement).style.color = arenaMetadata.color : "";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.target as HTMLButtonElement).style.color = "var(--text-dim)";
          }}
        >
          ← BACK
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 22,
              color: "#fff",
              letterSpacing: "0.2em",
              textShadow: `0 0 30px ${arenaMetadata?.color}`,
            }}
          >
            {arenaMetadata?.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--text-dim)",
              marginTop: 2,
            }}
          >
            GUARDIAN: {arenaMetadata?.guardian}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: arenaMetadata?.color,
            letterSpacing: "0.2em",
            padding: "4px 12px",
            border: `1px solid ${arenaMetadata?.color}`,
            background: `${arenaMetadata?.color}11`,
          }}
        >
          STATUS: INFILTRATING
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          padding: 32,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* Left: Hint + Vault */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Hint panel */}
          <div
            style={{
              background: "var(--surface)",
              border: `1px solid ${arenaMetadata?.color}44`,
              padding: 28,
              position: "relative",
              boxShadow: `0 0 40px ${arenaMetadata?.color}11`,
              animation: "slide-in-right 0.5s ease backwards",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -1,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${arenaMetadata?.color}, transparent)`,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                letterSpacing: "0.25em",
                color: arenaMetadata?.color,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 17 }}>💡</span> GUARDIAN HINT
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 17,
                lineHeight: 1.8,
                color: "var(--text)",
                fontStyle: "italic",
                borderLeft: `2px solid ${arenaMetadata?.color}66`,
                paddingLeft: 16,
              }}
            >
              "{arenaDetails?.hint}"
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-dim)",
                letterSpacing: "0.2em",
              }}
            >
              — {arenaMetadata?.guardian}
            </div>
          </div>

          {/* Vault panel */}
          <div
            style={{
              background: "var(--surface)",
              border: `1px solid ${vaultStatus === "cracked" ? "#00e676" : vaultStatus === "shaking" ? "#ff3333" : "var(--border)"}`,
              padding: 28,
              animation:
                vaultStatus === "shaking"
                  ? "lock-shake 0.5s ease"
                  : "slide-in-right 0.6s ease backwards",
              animationDelay: "0.1s",
              boxShadow:
                vaultStatus === "cracked"
                  ? "0 0 40px rgba(0,230,118,0.3)"
                  : "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            {vaultStatus === "cracked" ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: 24,
                    color: "#00e676",
                    letterSpacing: "0.2em",
                    textShadow: "0 0 40px #00e676",
                    animation: "flicker 2s infinite",
                  }}
                >
                  VAULT CRACKED!
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-dim)",
                    marginTop: 8,
                  }}
                >
                  WELL DONE, INFILTRATOR. THE SENTINEL IS DEFEATED. VAULT FUNDS HAS BEEN TRANSFERRED TO YOU.
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 12,
                    letterSpacing: "0.25em",
                    color: "var(--text-dim)",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 17 }}>🔐</span> VAULT ACCESS TERMINAL
                </div>

                {/* Vault visual */}
                <div className="flex justify-center items-center gap-5">
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: 24,
                      fontFamily: "var(--font-mono)",
                      fontSize: 48,
                      animation:
                        vaultStatus === "shaking"
                          ? "lock-shake 0.5s"
                          : "float 4s ease-in-out infinite",
                    }}
                  >
                    🏛️
                  </div>
                  <p className="font-bold text-xl">Balance: {`${balance?.uiAmount} USDC`}</p>
                </div>
                <div
                  style={{
                    marginBottom: 12,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-dim)",
                    letterSpacing: "0.15em",
                  }}
                >
                  ENTER VAULT PASSWORD:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={passwordVal}
                    onChange={(e) => setPasswordVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verifyGuess()}
                    placeholder="TYPE PASSWORD..."
                    style={{
                      flex: 1,
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      padding: "12px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "#fff",
                      letterSpacing: "0.3em",
                      outline: "none",
                      clipPath:
                        "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
                    }}
                    onFocus={(e) =>
                      (arenaMetadata ? e.target.style.borderColor = arenaMetadata.color : "")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <button
                    onClick={verifyGuess}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      padding: "12px 20px",
                      background: `linear-gradient(135deg, ${arenaMetadata?.color}, ${arenaMetadata?.color}88)`,
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                      clipPath:
                        "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      transition: "all 0.2s",
                    }}
                  >
                    CRACK
                  </button>
                </div>
                {vaultStatus === "shaking" && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "#ff4444",
                      marginTop: 8,
                      animation: "reveal 0.5s",
                    }}
                  >
                    ⚠ ACCESS DENIED — INCORRECT PASSWORD
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 200px)",
            minHeight: 500,
            animation: "slide-in-right 0.7s ease backwards",
            animationDelay: "0.2s",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scrolling data lines BG */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.03,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, ${arenaMetadata?.color} 24px, ${arenaMetadata?.color} 25px)`,
              animation: "data-stream 4s linear infinite",
            }}
          />

          {/* Chat header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(6,13,20,0.9)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${arenaMetadata?.color}, var(--pink))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 16px ${arenaMetadata?.color}88`,
                animation: "pulse-border 2s ease-in-out infinite",
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.15em",
                }}
              >
                {arenaMetadata?.guardian}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#00e676",
                    animation: "pulse-border 1.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#00e676",
                    letterSpacing: "0.15em",
                  }}
                >
                  ONLINE
                </span>
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-dim)",
                letterSpacing: "0.15em",
              }}
            >
              ENCRYPTED CHANNEL
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {chats.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, var(--cyan), var(--pink))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  ⚡
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: arenaMetadata?.color,
                        animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-dim)",
                      marginLeft: 4,
                    }}
                  >
                    PROCESSING...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid var(--border)",
              background: "rgba(6,13,20,0.95)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Interrogate ${arenaMetadata?.guardian}...`}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  padding: "12px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "#fff",
                  outline: "none",
                  clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={(e) =>
                  (arenaMetadata ? e.target.style.borderColor = arenaMetadata?.color : "")
                }
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  padding: "12px 20px",
                  background: loading
                    ? "rgba(0,255,224,0.2)"
                    : `linear-gradient(135deg, ${arenaMetadata?.color}, ${arenaMetadata?.color}88)`,
                  color: loading ? "var(--text-dim)" : "#000",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  clipPath:
                    "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  transition: "all 0.2s",
                }}
              >
                TRANSMIT
              </button>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-dim)",
                marginTop: 8,
                letterSpacing: "0.15em",
              }}
            >
              ⚡ Hint: Ask the guardian about the vault, its secrets, or what
              you seek.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArenaView;
