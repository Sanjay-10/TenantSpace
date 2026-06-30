import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", success: "#10B981", successLight: "#ECFDF5",
  warning: "#F59E0B", warningLight: "#FFFBEB", danger: "#EF4444",
  g1: "#1D4ED8", g3: "#3B82F6",
};

type HomeStatus = "active" | "past";

interface Home {
  id: number;
  propertyName: string;
  address: string;
  room: string;
  moveIn: string;
  moveOut?: string;
  rent: number;
  status: HomeStatus;
  landlord: string;
  daysLeft?: number;
  rentDue?: string;
  rentPaid?: boolean;
}

const homes: Home[] = [
  {
    id: 1,
    propertyName: "Maple Grove",
    address: "12 Maple St, London E1 4RD",
    room: "Room 2B",
    moveIn: "Sep 2024",
    rent: 850,
    status: "active",
    landlord: "Sarah Mitchell",
    daysLeft: 142,
    rentDue: "1 Jun 2026",
    rentPaid: false,
  },
  {
    id: 2,
    propertyName: "The Birches",
    address: "8 Birch Lane, London N4 2HJ",
    room: "Room 3",
    moveIn: "Jan 2023",
    moveOut: "Aug 2024",
    rent: 720,
    status: "past",
    landlord: "James Harper",
    rentPaid: true,
  },
  {
    id: 3,
    propertyName: "Cedar Court",
    address: "22 Cedar Ave, London SE5 9KQ",
    room: "Studio A",
    moveIn: "Mar 2021",
    moveOut: "Dec 2022",
    rent: 650,
    status: "past",
    landlord: "Linda Osei",
    rentPaid: true,
  },
];

export function TenantHomeScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  const current = homes.filter(h => h.status === "active");
  const previous = homes.filter(h => h.status === "past");

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
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5, marginTop: 2 }}>My Homes</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 40, height: 40, borderRadius: 20, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.mutedFg, fontWeight: 700 }}>+</button>
            <button style={{ width: 40, height: 40, borderRadius: 20, background: C.muted, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚙️</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Current home */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Current</div>

          {current.map(home => (
            <div
              key={home.id}
              onClick={() => setSelected(home.id === selected ? null : home.id)}
              style={{ background: C.card, borderRadius: 20, border: `2px solid ${selected === home.id ? C.primary : C.border}`, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
            >
              {/* Gradient header */}
              <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, padding: "18px 18px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, borderRadius: 65, border: "1.5px solid rgba(255,255,255,0.12)" }} />
                <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: 100, border: "1px solid rgba(255,255,255,0.06)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{home.propertyName}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>{home.address}</div>
                  </div>
                  <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.2)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>● Active</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    { label: "Room", value: home.room },
                    { label: "Rent", value: `£${home.rent}/mo` },
                    { label: "Since", value: home.moveIn },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification hint — single compact row */}
              <div style={{ background: C.card, padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: C.primary, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.mutedFg }}>4 new updates</span>
                </div>
                <span style={{ fontSize: 12, color: C.mutedFg }}>›</span>
              </div>

            </div>
          ))}
        </div>

        {/* Previous homes */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Previous</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {previous.map(home => (
              <div
                key={home.id}
                onClick={() => setSelected(home.id === selected ? null : home.id)}
                style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏠</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{home.propertyName}</div>
                  <div style={{ fontSize: 11, color: C.mutedFg, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{home.address}</div>
                  <div style={{ fontSize: 11, color: C.mutedFg }}>{home.moveIn} – {home.moveOut}</div>
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
