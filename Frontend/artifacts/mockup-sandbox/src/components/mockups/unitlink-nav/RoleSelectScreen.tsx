import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", g1: "#1D4ED8", g3: "#3B82F6",
};

type Role = "landlord" | "tenant" | null;

export function RoleSelectScreen() {
  const [role, setRole] = useState<Role>(null);

  const roles: { key: Role; icon: string; title: string; sub: string; features: { icon: string; text: string }[] }[] = [
    {
      key: "landlord",
      icon: "🏘️",
      title: "I'm a Landlord",
      sub: "I own or manage rental properties",
      features: [
        { icon: "🚪", text: "Manage rooms & tenants" },
        { icon: "💸", text: "Track rent & payments" },
        { icon: "🛠️", text: "Handle maintenance requests" },
        { icon: "📋", text: "Assign chores & rotations" },
      ],
    },
    {
      key: "tenant",
      icon: "🏠",
      title: "I'm a Tenant",
      sub: "I'm renting a room or unit",
      features: [
        { icon: "🛏️", text: "View my room & lease details" },
        { icon: "💳", text: "Pay rent in-app" },
        { icon: "💬", text: "Message my landlord" },
        { icon: "🗂️", text: "Access my documents" },
      ],
    },
  ];

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Top bar */}
      <div style={{ background: C.card, padding: "12px 20px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: C.muted, border: "none", cursor: "pointer", fontSize: 16, color: C.mutedFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.fg, letterSpacing: -0.3 }}>Choose your role</div>
          <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>Step 2 of 2</div>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: C.primary }} />
          <div style={{ width: 20, height: 6, borderRadius: 3, background: C.primary }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Hero card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 24, padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, border: "1px solid rgba(255,255,255,0.08)" }} />

          <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            🎉
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.4, marginBottom: 6 }}>Almost there!</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Tell us how you'll use UnitLink so we can set things up for you.</div>
        </div>

        {/* Role cards */}
        {roles.map(r => {
          const selected = role === r.key;
          return (
            <div
              key={r.key!}
              onClick={() => setRole(r.key)}
              style={{ background: selected ? C.accent : C.card, borderRadius: 18, border: `${selected ? 2 : 1}px solid ${selected ? C.primary : C.border}`, padding: "18px 18px", cursor: "pointer", position: "relative", transition: "border-color 0.15s, background 0.15s" }}
            >
              {/* Check */}
              {selected && (
                <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, borderRadius: 11, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 900 }}>✓</span>
                </div>
              )}

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: selected ? C.primary : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, transition: "background 0.15s" }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.fg, letterSpacing: -0.2 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{r.sub}</div>
                </div>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.features.map(f => (
                  <div key={f.text} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: selected ? "#DBEAFE" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{f.icon}</div>
                    <span style={{ fontSize: 12, color: selected ? C.fg : C.mutedFg }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <button
          style={{ width: "100%", padding: "15px", borderRadius: 14, background: role ? C.primary : C.muted, border: "none", color: role ? "#fff" : C.mutedFg, fontSize: 15, fontWeight: 700, cursor: role ? "pointer" : "not-allowed", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <span>{role ? `Continue as ${role === "landlord" ? "Landlord" : "Tenant"}` : "Select a role to continue"}</span>
          {role && <span>→</span>}
        </button>

        <div style={{ fontSize: 12, color: C.mutedFg, textAlign: "center" }}>
          You can change this anytime in Settings.
        </div>
      </div>
    </div>
  );
}
