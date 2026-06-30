import React from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", g1: "#1D4ED8", g3: "#3B82F6",
};

export function LandlordEmptyHomeScreen() {
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
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5, marginTop: 2 }}>Sarah Mitchell</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>SM</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Hero illustration card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 24, padding: "32px 24px", width: "100%", textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, border: "1px solid rgba(255,255,255,0.08)" }} />

          <div style={{ width: 72, height: 72, borderRadius: 36, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            🏘️
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.4, marginBottom: 6 }}>No properties yet</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Add your first property to start managing rooms, tenants, and rent.</div>
        </div>

        {/* Primary CTA */}
        <button style={{ width: "100%", padding: "16px", borderRadius: 14, background: C.primary, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>+</span>
          <span>Add Your First Property</span>
        </button>

        {/* What you can do */}
        <div style={{ width: "100%", background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>What you can do</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🚪", title: "Manage rooms", body: "Add rooms with rent, deposit, and details." },
              { icon: "👥", title: "Invite tenants", body: "Generate invite codes for tenants to join." },
              { icon: "💸", title: "Track rent", body: "See who's paid and who's pending each month." },
              { icon: "🛠️", title: "Handle requests", body: "Receive and resolve maintenance requests." },
            ].map(f => (
              <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2, lineHeight: 1.4 }}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div style={{ fontSize: 12, color: C.mutedFg, textAlign: "center", marginTop: 4 }}>
          Are you a tenant? <span style={{ color: C.primary, fontWeight: 600 }}>Switch to tenant mode</span>
        </div>

      </div>
    </div>
  );
}
