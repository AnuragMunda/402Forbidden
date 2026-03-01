function DifficultyBars({ level, color }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 16,
            background: i <= level ? color : "rgba(255,255,255,0.08)",
            borderRadius: 2,
            boxShadow: i <= level ? `0 0 6px ${color}` : "none",
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}

export default DifficultyBars;
