import React, { useState } from "react";

const C = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  fg: "#0F172A",
  muted: "#F1F5F9",
  mutedFg: "#64748B",
  border: "#E2E8F0",
  primary: "#2563EB",
  accent: "#EFF6FF",
  bubble: "#EFF6FF",
  bubbleOwn: "#2563EB",
};

const messages = [
  { id: 1, from: "James Liu", avatar: "JL", text: "Hi, the boiler in Room 1B is making a loud noise again.", time: "10:02", own: false },
  { id: 2, from: "me", text: "Thanks for letting me know. I'll get someone to look at it this week.", time: "10:05", own: true },
  { id: 3, from: "James Liu", avatar: "JL", text: "It's been going on since yesterday evening. Really quite loud.", time: "10:06", own: false },
  { id: 4, from: "me", text: "Understood. I've logged a request. Plumber coming Tuesday 9–12. Will that work?", time: "10:09", own: true },
  { id: 5, from: "James Liu", avatar: "JL", text: "Yes that works, I'll make sure I'm in.", time: "10:11", own: false },
  { id: 6, from: "me", text: "Great, I'll send you a reminder Monday evening.", time: "10:12", own: true },
];

export function ChatFullScreen() {
  const [input, setInput] = useState("");

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.fg }}>●●●</span>
          <span style={{ fontSize: 11, color: C.fg }}>🔋</span>
        </div>
      </div>

      {/* Chat header — full screen, no tabs */}
      <div style={{ background: C.card, padding: "10px 16px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: C.mutedFg }}>←</span>
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>JL</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.fg }}>James Liu</div>
            <div style={{ fontSize: 11, color: C.mutedFg }}>Room 1B · Maple Grove</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>📞</span>
          </button>
        </div>
      </div>

      {/* Date divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px 4px" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 11, color: C.mutedFg, fontWeight: 600 }}>Today</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", flexDirection: msg.own ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
            {!msg.own && (
              <div style={{ width: 30, height: 30, borderRadius: 15, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.primary }}>{msg.avatar}</span>
              </div>
            )}
            <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: msg.own ? "flex-end" : "flex-start", gap: 3 }}>
              <div style={{
                padding: "10px 13px",
                borderRadius: msg.own ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.own ? C.bubbleOwn : C.bubble,
                border: msg.own ? "none" : `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 13, color: msg.own ? "#fff" : C.fg, lineHeight: 1.45 }}>{msg.text}</span>
              </div>
              <span style={{ fontSize: 10, color: C.mutedFg }}>{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message input — keyboard-safe, full width */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "10px 16px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, background: C.muted, borderRadius: 22, padding: "10px 16px", display: "flex", alignItems: "center", border: `1px solid ${C.border}` }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message James..."
              style={{ border: "none", background: "transparent", flex: 1, fontSize: 14, color: C.fg, outline: "none", fontFamily: "inherit" }}
            />
            <button style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, padding: 0 }}>📎</button>
          </div>
          <button style={{
            width: 42, height: 42, borderRadius: 21,
            background: input.trim() ? C.primary : C.muted,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}>
            <span style={{ fontSize: 16, transform: "rotate(45deg)", display: "block", color: input.trim() ? "#fff" : C.mutedFg }}>➤</span>
          </button>
        </div>
      </div>

      {/* Safe area */}
      <div style={{ height: 20, background: C.card, flexShrink: 0 }} />
    </div>
  );
}
