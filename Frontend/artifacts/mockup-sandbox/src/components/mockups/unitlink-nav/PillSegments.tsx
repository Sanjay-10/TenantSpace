import { useState } from "react";

export function PillSegments() {
  const [activeTab, setActiveTab] = useState("overview");

  const colors = {
    background: "#F8FAFC",
    card: "#FFFFFF",
    foreground: "#0F172A",
    mutedForeground: "#64748B",
    muted: "#F1F5F9",
    border: "#E2E8F0",
    primary: "#2563EB",
    accent: "#EFF6FF",
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "rooms", label: "Rooms" },
    { key: "tenants", label: "Tenants" },
    { key: "requests", label: "Requests", badge: 2 },
    { key: "finances", label: "Finances" },
  ];

  const content: Record<string, React.ReactNode> = {
    overview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["6", "Rooms"], ["4", "Tenants"], ["£3,200", "Collected"], ["2", "Requests"]].map(([val, label]) => (
            <div key={label} style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: colors.foreground, letterSpacing: -0.3 }}>{val}</div>
              <div style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "10px 14px", border: "1px solid #BFDBFE" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>✅ Why this works</div>
          <div style={{ fontSize: 11, color: "#1E40AF", marginTop: 3, lineHeight: 1.5 }}>All tabs visible in the header — no scrolling, no guessing. Segments fit within screen width.</div>
        </div>
      </div>
    ),
    rooms: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["Room 1A — Alice Chen", "Room 1B — James Liu", "Room 2A — Priya Patel", "Room 2B — Vacant", "Room 3A — Tom Obi", "Room 3B — Vacant"].map((r, i) => (
          <div key={i} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: r.includes("Vacant") ? colors.muted : colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚪</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{r.split(" — ")[0]}</div>
              <div style={{ fontSize: 11, color: r.includes("Vacant") ? "#F59E0B" : colors.mutedForeground }}>{r.split(" — ")[1]}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    tenants: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[["Alice Chen", "Room 1A", "✅ Paid"], ["James Liu", "Room 1B", "⏳ Pending"], ["Priya Patel", "Room 2A", "✅ Paid"], ["Tom Obi", "Room 3A", "✅ Paid"]].map(([name, room, status]) => (
          <div key={name} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: colors.primary }}>{name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{name}</div>
              <div style={{ fontSize: 11, color: colors.mutedForeground }}>{room}</div>
            </div>
            <span style={{ fontSize: 11 }}>{status}</span>
          </div>
        ))}
      </div>
    ),
    requests: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[["Boiler not working", "Room 1B · James Liu", "Urgent"], ["WiFi drops in Room 3", "Room 3A · Tom Obi", "Normal"]].map(([title, sub, priority]) => (
          <div key={title} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{title}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: priority === "Urgent" ? "#EF4444" : "#F59E0B", background: priority === "Urgent" ? "#FEE2E2" : "#FFFBEB", padding: "2px 7px", borderRadius: 6 }}>{priority}</span>
            </div>
            <div style={{ fontSize: 11, color: colors.mutedForeground }}>{sub}</div>
          </div>
        ))}
      </div>
    ),
    finances: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)", borderRadius: 16, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, opacity: 0.8, textTransform: "uppercase" }}>Total Collected</div>
          <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6, letterSpacing: -0.5 }}>£3,200</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>May 2026 · 3 of 4 paid</div>
        </div>
        {[["Alice Chen", "£800", "Paid"], ["James Liu", "£800", "Pending"], ["Priya Patel", "£800", "Paid"], ["Tom Obi", "£800", "Paid"]].map(([name, amt, status]) => (
          <div key={name} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: colors.foreground }}>{name}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{amt}</span>
              <span style={{ fontSize: 11, color: status === "Paid" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>{status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div style={{ width: 390, height: 844, background: colors.background, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Status bar */}
      <div style={{ height: 44, background: colors.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.foreground }}>9:41</span>
        <span style={{ fontSize: 12, color: colors.foreground }}>●●●</span>
      </div>

      {/* Header with pill segments EMBEDDED — fully visible, no scroll */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, padding: "12px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: colors.mutedForeground }}>←</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.foreground, letterSpacing: -0.3 }}>Maple Grove</div>
            <div style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>6 Rooms · 4 Tenants</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: colors.mutedForeground }}>⋮</span>
          </div>
        </div>

        {/* Pill segment row — all visible, no scrolling needed */}
        <div style={{ background: colors.muted, borderRadius: 12, padding: 4, display: "flex", gap: 2 }}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  borderRadius: 9,
                  border: "none",
                  background: isActive ? colors.card : "transparent",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: isActive ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? colors.primary : colors.mutedForeground, whiteSpace: "nowrap" }}>
                  {tab.label}
                </div>
                {tab.badge ? (
                  <div style={{ position: "absolute", top: 2, right: 4, width: 14, height: 14, borderRadius: 7, background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{tab.badge}</span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto" }}>
        {content[activeTab]}
      </div>

      {/* Bottom bar — clean, minimal, no tabs needed here */}
      <div style={{ height: 34, background: colors.card, borderTop: `1px solid ${colors.border}` }} />
    </div>
  );
}
