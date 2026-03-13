function ChatMessage({ msg }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
        marginBottom: 12,
        animation: "reveal 0.3s ease",
      }}
    >
      {msg.role === "model" && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: "linear-gradient(135deg, var(--cyan), var(--pink))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            marginRight: 10,
            marginTop: 2,
            boxShadow: "0 0 12px var(--cyan)",
          }}
        >
          ⚡
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          background:
            msg.role === "user" ? "rgba(0,255,224,0.1)" : "var(--surface2)",
          border: `1px solid ${msg.role === "user" ? "rgba(0,255,224,0.3)" : "var(--border)"}`,
          fontFamily: "var(--font-body)",
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "var(--text)",
          clipPath:
            msg.role === "user"
              ? "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 0px) 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default ChatMessage;
