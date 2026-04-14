import { useState } from "react";
import DifficultyBars from "./difficulty-bars";
import HexIcon from "./hex-icon";
import { ArenaCardParams } from "@/lib/types";
import { ARENAS_STATIC } from "@/constants";

function ArenaCard({ arena, walletConnected, onOpen }: ArenaCardParams) {
  const [hovered, setHovered] = useState(false);
  const locked = !walletConnected;

  const arenaMetadata = ARENAS_STATIC.find((a) => a.id === arena.arenaId);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        !locked && onOpen(arena);
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }}
      style={{
        position: "relative",
        background:
          hovered && !locked
            ? `linear-gradient(135deg, rgba(${arenaMetadata?.color === "#00ffe0" ? "0,255,224" : arenaMetadata?.color === "#ff3cac" ? "255,60,172" : arenaMetadata?.color === "#f9a825" ? "249,168,37" : arenaMetadata?.color === "#7c4dff" ? "124,77,255" : arenaMetadata?.color === "#ff6b35" ? "255,107,53" : "0,230,118"},0.08) 0%, var(--surface) 60%)`
            : "var(--surface)",
        border: `1px solid ${hovered && !locked ? arenaMetadata?.color : "var(--border)"}`,
        padding: "28px 24px",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:
          hovered && !locked
            ? `0 0 30px ${arenaMetadata?.color}22, inset 0 0 20px ${arenaMetadata?.color}08`
            : "none",
        animation: "reveal 0.6s ease backwards",
        animationDelay: `${(arenaMetadata?.id ?? 0) * 0.1}s`,
        overflow: "hidden",
      }}
    >
      {/* Corner decorations */}
      {["topleft", "topright", "bottomleft", "bottomright"].map((corner, i) => (
        <div
          key={corner}
          style={{
            position: "absolute",
            [corner.includes("top") ? "top" : "bottom"]: -1,
            [corner.includes("left") ? "left" : "right"]: -1,
            width: 16,
            height: 16,
            borderTop: corner.includes("top")
              ? `2px solid ${arenaMetadata?.color}`
              : "none",
            borderBottom: corner.includes("bottom")
              ? `2px solid ${arenaMetadata?.color}`
              : "none",
            borderLeft: corner.includes("left")
              ? `2px solid ${arenaMetadata?.color}`
              : "none",
            borderRight: corner.includes("right")
              ? `2px solid ${arenaMetadata?.color}`
              : "none",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.3s",
          }}
        />
      ))}

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            padding: "3px 10px",
            background: locked
              ? "rgba(255,255,255,0.04)"
              : `${arenaMetadata?.color}22`,
            border: `1px solid ${locked ? "var(--border)" : arenaMetadata?.color}`,
            color: locked ? "var(--text-dim)" : arenaMetadata?.color,
            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
          }}
        >
          {locked ? "🔒 LOCKED" : arena.isActive ? "ACTIVE" : "INACTIVE"}
        </div>
        <DifficultyBars
          level={arenaMetadata?.difficulty}
          color={arenaMetadata?.color}
        />
      </div>

      {/* Arena icon */}
      <div
        style={{
          marginBottom: 16,
          opacity: locked ? 0.3 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <HexIcon color={arenaMetadata?.color} size={52}>
          {locked
            ? "⛔"
            : ["⚡", "🌐", "👁", "🌀", "🔱", "🔐"][arenaMetadata?.id ?? 0]}
        </HexIcon>
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 16,
          color: locked ? "var(--text-dim)" : "#fff",
          letterSpacing: "0.15em",
          marginBottom: 4,
          textShadow:
            !locked && hovered ? `0 0 20px ${arenaMetadata?.color}` : "none",
          transition: "text-shadow 0.3s",
        }}
      >
        {arenaMetadata?.name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          marginBottom: 20,
        }}
      >
        {arenaMetadata?.subtitle}
      </div>

      {/* Guardian label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: locked ? "var(--text-dim)" : arenaMetadata?.color,
          opacity: locked ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: arenaMetadata?.color,
            boxShadow: `0 0 6px ${arenaMetadata?.color}`,
          }}
        />
        GUARDIAN: {arenaMetadata?.guardian}
      </div>

      {/* Hover CTA */}
      {!locked && hovered && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px",
            background: `linear-gradient(to top, ${arenaMetadata?.color}33, transparent)`,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: arenaMetadata?.color,
            animation: "reveal 0.2s ease",
          }}
        >
          ENTER ARENA →
        </div>
      )}

      {/* Locked overlay */}
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2,4,8,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(1px)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: "0.2em",
              textAlign: "center",
            }}
          >
            CONNECT WALLET
            <br />
            TO UNLOCK
          </div>
        </div>
      )}
    </div>
  );
}

export default ArenaCard;
