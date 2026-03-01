function GridBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
        linear-gradient(rgba(0,255,224,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,224,0.03) 1px, transparent 1px)
      `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

export default GridBackground;