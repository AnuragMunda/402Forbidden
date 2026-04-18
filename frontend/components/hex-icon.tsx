import { ReactNode } from "react";

function HexIcon({
  color = "#00ffe0",
  size = 40,
  children,
}: {
  color: string;
  size: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        animation: "float 3s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        />
      </svg>
      <span style={{ fontSize: size * 0.35, position: "relative", zIndex: 1 }}>
        {children}
      </span>
    </div>
  );
}

export default HexIcon;
