export function Current() {
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

  const tabs = ["Overview", "Rooms", "Tenants", "Requests", "Financials", "Docs"];
  const activeTab = "Overview";

  return (
    <div style={{ width: 390, height: 844, background: colors.background, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Status bar */}
      <div style={{ height: 44, background: colors.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.foreground }}>9:41</span>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 12, color: colors.foreground }}>●●●</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: colors.card, padding: "14px 16px 10px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
      </div>

      {/* THE BAD UX: Horizontal scroll tabs — no indicator that more exist */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, display: "flex", overflowX: "auto", scrollbarWidth: "none", position: "relative" }}>
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <div key={tab} style={{ flexShrink: 0, padding: "12px 14px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? colors.primary : colors.mutedForeground, whiteSpace: "nowrap" }}>
                {tab}
              </span>
              <div style={{ height: 3, width: "100%", minWidth: 40, borderRadius: 3, background: isActive ? colors.primary : "transparent" }} />
            </div>
          );
        })}
        {/* No fade/arrow hint — user doesn't know there's more! */}
      </div>

      {/* Problem callouts */}
      <div style={{ margin: "12px 16px 0", padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>❌ Problem 1: Hidden tabs</div>
        <div style={{ fontSize: 11, color: "#7F1D1D", lineHeight: 1.5 }}>
          "Financials" and "Docs" are cut off. No fade, arrow, or dot to hint there's more. Users miss options entirely.
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        <div style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.foreground, marginBottom: 12 }}>Overview</div>
          {[["Rooms", "6"], ["Tenants", "4"], ["Rent Collected", "£3,200"], ["Open Requests", "2"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: 13, color: colors.mutedForeground }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 14px", background: "#FFFBEB", borderRadius: 10, border: "1px solid #FDE68A" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>❌ Problem 2: Top-heavy nav</div>
          <div style={{ fontSize: 11, color: "#78350F", lineHeight: 1.5 }}>
            All navigation at the top means users must reach up. Bottom of screen (thumb zone) is completely wasted.
          </div>
        </div>
      </div>

      {/* Empty bottom — wasted thumb zone */}
      <div style={{ height: 80, background: colors.card, borderTop: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: "#CBD5E1", letterSpacing: 0.5 }}>THUMB ZONE — WASTED</span>
      </div>
    </div>
  );
}
