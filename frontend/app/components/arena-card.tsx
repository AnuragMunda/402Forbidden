import { useState } from "react";
import DifficultyBars from "./difficulty-bars";
import HexIcon from "./hex-icon";

function ArenaCard({ arena, walletConnected, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const locked = !walletConnected;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !locked && onOpen(arena)}
      style={{
        position: "relative",
        background:
          hovered && !locked
            ? `linear-gradient(135deg, rgba(${arena.color === "#00ffe0" ? "0,255,224" : arena.color === "#ff3cac" ? "255,60,172" : arena.color === "#f9a825" ? "249,168,37" : arena.color === "#7c4dff" ? "124,77,255" : arena.color === "#ff6b35" ? "255,107,53" : "0,230,118"},0.08) 0%, var(--surface) 60%)`
            : "var(--surface)",
        border: `1px solid ${hovered && !locked ? arena.color : "var(--border)"}`,
        padding: "28px 24px",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:
          hovered && !locked
            ? `0 0 30px ${arena.color}22, inset 0 0 20px ${arena.color}08`
            : "none",
        animation: "reveal 0.6s ease backwards",
        animationDelay: `${arena.id * 0.1}s`,
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
              ? `2px solid ${arena.color}`
              : "none",
            borderBottom: corner.includes("bottom")
              ? `2px solid ${arena.color}`
              : "none",
            borderLeft: corner.includes("left")
              ? `2px solid ${arena.color}`
              : "none",
            borderRight: corner.includes("right")
              ? `2px solid ${arena.color}`
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
            background: locked ? "rgba(255,255,255,0.04)" : `${arena.color}22`,
            border: `1px solid ${locked ? "var(--border)" : arena.color}`,
            color: locked ? "var(--text-dim)" : arena.color,
            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
          }}
        >
          {locked ? "🔒 LOCKED" : arena.status}
        </div>
        <DifficultyBars level={arena.difficulty} color={arena.color} />
      </div>

      {/* Arena icon */}
      <div
        style={{
          marginBottom: 16,
          opacity: locked ? 0.3 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <HexIcon color={arena.color} size={52}>
          {locked ? "⛔" : ["⚡", "🌐", "👁", "🌀", "🔱", "🔐"][arena.id - 1]}
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
          textShadow: !locked && hovered ? `0 0 20px ${arena.color}` : "none",
          transition: "text-shadow 0.3s",
        }}
      >
        {arena.name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          marginBottom: 20,
        }}
      >
        {arena.subtitle}
      </div>

      {/* Guardian label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: locked ? "var(--text-dim)" : arena.color,
          opacity: locked ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: arena.color,
            boxShadow: `0 0 6px ${arena.color}`,
          }}
        />
        GUARDIAN: {arena.guardian}
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
            background: `linear-gradient(to top, ${arena.color}33, transparent)`,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: arena.color,
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
