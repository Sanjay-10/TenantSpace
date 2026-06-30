import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", g1: "#1D4ED8", g3: "#3B82F6",
};

export function TenantEmptyHomeScreen() {
  const [code, setCode] = useState("");

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "14px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>Welcome 👋</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5, marginTop: 2 }}>Hi, Alex</div>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 20, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚙️</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Hero illustration card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 24, padding: "32px 24px", width: "100%", textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, border: "1px solid rgba(255,255,255,0.08)" }} />

          <div style={{ width: 72, height: 72, borderRadius: 36, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            🏠
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.4, marginBottom: 6 }}>No homes yet</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Join your first room with the invite code your landlord sent you.</div>
        </div>

        {/* Invite code form */}
        <div style={{ width: "100%", background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Invite Code</div>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. MAPLE-2B-9X4P"
            style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16, fontWeight: 600, color: C.fg, fontFamily: "inherit", outline: "none", letterSpacing: 1, textAlign: "center" }}
          />
          <button style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 12, background: code ? C.primary : C.muted, border: "none", color: code ? "#fff" : C.mutedFg, fontSize: 14, fontWeight: 700, cursor: code ? "pointer" : "not-allowed" }}>
            Join Room
          </button>
        </div>

        {/* Help / how it works */}
        <div style={{ width: "100%", background: C.accent, borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 4 }}>How it works</div>
            <div style={{ fontSize: 12, color: "#1D4ED8", lineHeight: 1.5 }}>Ask your landlord for an invite code. Once you join, you'll see your room, rent, and chats here.</div>
          </div>
        </div>

        {/* Footer hint */}
        <div style={{ marginTop: 28, fontSize: 12, color: C.mutedFg, textAlign: "center" }}>
          Don't have an invite? <span style={{ color: C.primary, fontWeight: 600 }}>Contact support</span>
        </div>

      </div>

    </div>
  );
}
