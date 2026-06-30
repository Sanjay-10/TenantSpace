import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", success: "#10B981", warning: "#F59E0B",
  danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

const properties = [
  { id: 1, name: "Maple Grove", address: "12 Maple St, London", rooms: 5, tenants: 4, pending: 1, vacant: 1, collected: 3200, total: 4000 },
  { id: 2, name: "The Birches", address: "8 Birch Lane, London", rooms: 3, tenants: 3, pending: 0, vacant: 0, collected: 2400, total: 2400 },
  { id: 3, name: "Cedar Court", address: "22 Cedar Ave, London", rooms: 4, tenants: 2, pending: 1, vacant: 2, collected: 1600, total: 3200 },
];

export function LandlordHomeScreen() {
  const [activeTab, setActiveTab] = useState<"home" | "requests" | "settings">("home");

  const totalRooms = properties.reduce((a, p) => a + p.rooms, 0);
  const totalTenants = properties.reduce((a, p) => a + p.tenants, 0);
  const totalPending = properties.reduce((a, p) => a + p.pending, 0);
  const totalCollected = properties.reduce((a, p) => a + p.collected, 0);

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "14px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>Good morning 👋</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5, marginTop: 2 }}>Sarah Mitchell</div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>SM</span>
            </div>
            <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderRadius: 7, background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: "#fff" }}>3</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Properties", value: properties.length, icon: "🏘️", color: C.primaryLight },
            { label: "Rooms", value: totalRooms, icon: "🚪", color: "#F0FDF4" },
            { label: "Tenants", value: totalTenants, icon: "👥", color: "#FFFBEB" },
            { label: "Pending", value: totalPending, icon: "⏳", color: "#FEF2F2" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.fg }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.mutedFg }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 20, padding: "18px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, borderRadius: 65, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, opacity: 0.8, textTransform: "uppercase" }}>May 2026 — All Properties</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4, letterSpacing: -1 }}>£{totalCollected.toLocaleString()}</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>of £{(properties.reduce((a, p) => a + p.total, 0)).toLocaleString()} expected</div>
          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, marginTop: 14 }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#fff", width: `${Math.round(totalCollected / properties.reduce((a, p) => a + p.total, 0) * 100)}%` }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>Collected</div><div style={{ fontWeight: 700, fontSize: 14 }}>{Math.round(totalCollected / properties.reduce((a, p) => a + p.total, 0) * 100)}%</div></div>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>Pending</div><div style={{ fontWeight: 700, fontSize: 14, color: "#FCD34D" }}>{totalPending} rooms</div></div>
          </div>
        </div>

        {/* Properties list */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, letterSpacing: 1, textTransform: "uppercase" }}>My Properties</div>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 700, cursor: "pointer" }}>+ Add</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {properties.map(p => (
              <div key={p.id} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.fg }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 2 }}>{p.address}</div>
                  </div>
                  {p.pending > 0 && (
                    <div style={{ padding: "4px 10px", borderRadius: 20, background: "#FEF3C7", marginLeft: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{p.pending} pending</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { label: "Rooms", value: p.rooms },
                    { label: "Tenants", value: p.tenants },
                    { label: "Vacant", value: p.vacant, danger: p.vacant > 0 },
                    { label: "Collected", value: `£${p.collected.toLocaleString()}` },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div style={{ fontSize: 10, color: C.mutedFg, fontWeight: 500 }}>{stat.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: stat.danger ? C.danger : C.fg, marginTop: 1 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating chat FAB */}
      <div style={{ position: "absolute", bottom: 86, right: 16, zIndex: 10 }}>
        <button style={{ width: 52, height: 52, borderRadius: 26, background: C.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,99,235,0.4)", position: "relative" }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <div style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: 8, background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>5</span>
          </div>
        </button>
      </div>

      {/* Bottom pill tabs */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "10px 12px 20px", flexShrink: 0 }}>
        <div style={{ background: C.muted, borderRadius: 14, padding: 4, display: "flex", gap: 3 }}>
          {([{ key: "home", label: "Home" }, { key: "requests", label: "Requests" }, { key: "settings", label: "Settings" }] as const).map(t => {
            const isActive = t.key === activeTab;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: isActive ? C.card : "transparent", cursor: "pointer", boxShadow: isActive ? "0 1px 6px rgba(15,23,42,0.08)" : "none", position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? C.primary : C.mutedFg }}>{t.label}</div>
                {t.key === "requests" && <div style={{ position: "absolute", top: 3, right: 4, width: 14, height: 14, borderRadius: 7, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>3</span></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
