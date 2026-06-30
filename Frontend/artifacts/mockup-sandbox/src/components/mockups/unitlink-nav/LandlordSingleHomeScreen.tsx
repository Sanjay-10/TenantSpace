import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", success: "#10B981", successLight: "#ECFDF5",
  warning: "#F59E0B", warningLight: "#FFFBEB", danger: "#EF4444",
  g1: "#1D4ED8", g3: "#3B82F6",
};

type PropStatus = "active" | "past";

interface Property {
  id: number;
  name: string;
  address: string;
  rooms: number;
  tenants: number;
  rent: number;
  since: string;
  until?: string;
  status: PropStatus;
  alerts: number;
  unreadChats: number;
}

const properties: Property[] = [
  { id: 1, name: "Maple Grove", address: "12 Maple St, London E1 4RD", rooms: 4, tenants: 7, rent: 3200, since: "Mar 2022", status: "active", alerts: 2, unreadChats: 2 },
  { id: 2, name: "The Birches", address: "8 Birch Lane, London E8 2HJ", rooms: 3, tenants: 3, rent: 2400, since: "Jan 2021", status: "active", alerts: 0, unreadChats: 0 },
  { id: 3, name: "Oak House", address: "5 Oak Rd, London N4 1BG", rooms: 2, tenants: 0, rent: 1400, since: "Jun 2019", until: "Dec 2023", status: "past", alerts: 0, unreadChats: 0 },
  { id: 4, name: "Cedar Court", address: "22 Cedar Ave, London SE5 9KQ", rooms: 3, tenants: 0, rent: 2100, since: "Aug 2018", until: "May 2022", status: "past", alerts: 0, unreadChats: 0 },
];

export function LandlordSingleHomeScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  const current = properties.filter(p => p.status === "active");
  const previous = properties.filter(p => p.status === "past");

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
            <div style={{ fontSize: 12, color: C.mutedFg }}>Welcome back 👋</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5, marginTop: 2 }}>My Properties</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 40, height: 40, borderRadius: 20, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.mutedFg, fontWeight: 700 }}>+</button>
            <button style={{ width: 40, height: 40, borderRadius: 20, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚙️</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Current properties */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Current</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {current.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id === selected ? null : p.id)}
                style={{ background: C.card, borderRadius: 20, border: `2px solid ${selected === p.id ? C.primary : C.border}`, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
              >
                {/* Gradient header */}
                <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, padding: "18px 18px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, borderRadius: 65, border: "1.5px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: 100, border: "1px solid rgba(255,255,255,0.06)" }} />
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>{p.address}</div>
                    </div>
                    <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.2)" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>● Active</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {[
                      { label: "Rooms", value: String(p.rooms) },
                      { label: "Tenants", value: String(p.tenants) },
                      { label: "Rent/mo", value: `£${p.rent.toLocaleString()}` },
                      { label: "Since", value: p.since },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compact hint row */}
                <div style={{ background: C.card, padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: p.alerts > 0 ? C.danger : C.success, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.mutedFg }}>
                      {p.alerts > 0 ? `${p.alerts} requests · ${p.unreadChats} unread` : "All clear"}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: C.mutedFg }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous properties */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Previous</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {previous.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id === selected ? null : p.id)}
                style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏠</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.mutedFg, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.address}</div>
                  <div style={{ fontSize: 11, color: C.mutedFg }}>{p.since} – {p.until}</div>
                </div>
                <span style={{ fontSize: 18, color: C.mutedFg, flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
