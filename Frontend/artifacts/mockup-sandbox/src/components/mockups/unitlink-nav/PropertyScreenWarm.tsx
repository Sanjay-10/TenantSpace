import React from "react";

// Static UI — exact elements from original, premium home-themed background, no interactions

const C = {
  bg:          "linear-gradient(to bottom left, #F6F8FB 0%, #FBFCFD 18%, #F5F3F3 40%, #F5F3F3 100%)",
  card:        "#FFFFFF",
  fg:          "#0F172A",
  mutedFg:     "#64748B",
  border:      "rgba(148,163,184,0.15)",
  cardShadow:  "0 4px 18px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
  primary:     "#2563EB",
  accent:      "#EFF6FF",
  muted:       "#F1F5F9",
  g1:          "#1D4ED8",
  g3:          "#3B82F6",
  danger:      "#EF4444",
  glass:       "rgba(255,255,255,0.62)",
  glassBorder: "rgba(255,255,255,0.70)",
};

const rooms = [
  { name: "Room 1",   sub: "3 Tenants", tenants: [{ i: "JD", c: "#2563EB" }, { i: "MC", c: "#06B6D4" }, { i: "S",  c: "#F59E0B" }] },
  { name: "Basement", sub: "1 Tenant",  tenants: [{ i: "OW", c: "#10B981" }] },
  { name: "Room 2",   sub: "1 Tenant",  tenants: [{ i: "JL", c: "#8B5CF6" }] },
  { name: "Room 3",   sub: "2 Tenants", tenants: [{ i: "PP", c: "#EC4899" }, { i: "TO", c: "#F97316" }] },
];

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, boxShadow: C.cardShadow, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function HomeMotif() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      <div style={{ position: "absolute", left: 18, top: 92, width: 128, height: 128, borderRadius: 34, background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.42) 42%, rgba(255,255,255,0) 70%)", opacity: 0.95 }} />
      <div style={{ position: "absolute", right: -14, top: 138, width: 184, height: 184, borderRadius: 48, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.24) 45%, rgba(255,255,255,0) 72%)", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 35, top: 150, width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,0.58)", boxShadow: "0 10px 24px rgba(15,23,42,0.03)" }} />
      <div style={{ position: "absolute", right: 44, top: 474, width: 66, height: 66, borderRadius: 18, background: "rgba(255,255,255,0.50)", boxShadow: "0 10px 24px rgba(15,23,42,0.03)" }} />
      <div style={{ position: "absolute", left: 110, top: 56, width: 92, height: 92, borderRadius: 28, border: "1px solid rgba(148,163,184,0.08)", opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 224, top: 258, width: 76, height: 76, borderRadius: 22, border: "1px solid rgba(148,163,184,0.08)", opacity: 0.32 }} />
      <div style={{ position: "absolute", right: 22, top: 304, width: 120, height: 120, borderRadius: 36, background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))", transform: "rotate(18deg)", opacity: 0.7 }} />
      <div style={{ position: "absolute", left: 38, top: 336, width: 104, height: 104, borderRadius: 26, border: "1px solid rgba(148,163,184,0.06)", opacity: 0.28 }} />
    </div>
  );
}

export function PropertyScreenWarm() {
  return (
    <div style={{
      width: 390, height: 844,
      background: C.bg,
      fontFamily: "-apple-system, 'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
      userSelect: "none",
      borderRadius: 42,
      border: "1px solid rgba(15,23,42,0.18)",
      boxShadow: "0 28px 70px rgba(15,23,42,0.16), 0 0 0 6px rgba(255,255,255,0.55)",
      outline: "1px solid rgba(255,255,255,0.35)",
    }}>
      <HomeMotif />

      <div style={{ position: "relative", zIndex: 1, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: 1, color: C.fg }}>•••</span>
          <span style={{ fontSize: 13 }}>🔋</span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, background: "transparent", backdropFilter: "blur(16px)", padding: "10px 16px 12px", flexShrink: 0, borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", color: C.mutedFg, fontSize: 16, flexShrink: 0 }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: C.fg, letterSpacing: -0.5 }}>Maple Grove</div>
            <div style={{ fontSize: 12, color: C.mutedFg, background: "transparent", marginTop: 1 }}>12 Maple St, London E1 4RD</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", color: C.mutedFg, fontSize: 18, flexShrink: 0 }}>⋮</div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`,
            borderRadius: 22, padding: "18px 20px 16px",
            color: "#fff", position: "relative", overflow: "hidden",
            boxShadow: "0 10px 32px rgba(37,99,235,0.38)",
          }}>
            <div style={{ position: "absolute", right: -28, top: -28, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", right: 30, top: -50, width: 100, height: 100, borderRadius: 50, border: "1px solid rgba(255,255,255,0.08)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, opacity: 0.8, textTransform: "uppercase", marginBottom: 4 }}>This Month</div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8 }}>£3,200 <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.75 }}>/ £4,000</span></div>
              </div>
              <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 700 }}>80% in</div>
            </div>

            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)", overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: "80%", background: "rgba(255,255,255,0.9)", borderRadius: 2 }} />
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div><div style={{ fontSize: 10, opacity: 0.75 }}>Rooms</div><div style={{ fontSize: 18, fontWeight: 800 }}>4</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.75 }}>Tenants</div><div style={{ fontSize: 18, fontWeight: 800 }}>7</div></div>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px 110px", display: "flex", flexDirection: "column", gap: 10 }}>
          {rooms.map(r => (
            <Card key={r.name}>
              <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 20, color: C.primary }}>▦</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.fg }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{r.sub}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "row-reverse", marginRight: 4 }}>
                  {[...r.tenants].reverse().map((t, i) => (
                    <div key={i} style={{
                      width: 30, height: 30, borderRadius: 15,
                      background: t.c,
                      border: "2.5px solid #fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: "#fff",
                      marginLeft: i === r.tenants.length - 1 ? 0 : -10,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    }}>{t.i}</div>
                  ))}
                </div>
                <div style={{ fontSize: 20, color: C.border, marginLeft: 2 }}>›</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            padding: "14px 32px", borderRadius: 30,
            background: C.primary, color: "#fff",
            fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 6px 22px rgba(37,99,235,0.45)",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add Room
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 20, right: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, pointerEvents: "none" }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(37,99,235,0.45)", position: "relative" }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: 9, background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>2</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.mutedFg, fontWeight: 600 }}>Chats</div>
        </div>

      </div>

      <div style={{
        position: "relative",
        zIndex: 1,
        background: "rgba(245,243,243,0.78)",
        backdropFilter: "blur(24px)",
        borderTop: `0.5px solid rgba(148,163,184,0.20)`,
        padding: "10px 12px 24px",
        flexShrink: 0,
        boxShadow: "0 -1px 0 rgba(0,0,0,0.03)",
      }}>
        <div style={{ background: "rgba(241,245,249,0.85)", borderRadius: 14, padding: 4, display: "flex", gap: 3, border: `1px solid ${C.glassBorder}` }}>
          {[
            { label: "Rooms",   active: true,  badge: 0 },
            { label: "Rent",    active: false, badge: 0 },
            { label: "Updates", active: false, badge: 3 },
          ].map(tab => (
            <div key={tab.label} style={{
              flex: 1, padding: "10px 4px", borderRadius: 10,
              background: tab.active ? C.card : "transparent",
              boxShadow: tab.active ? "0 1px 6px rgba(15,23,42,0.09)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{ fontSize: 13, fontWeight: tab.active ? 700 : 500, color: tab.active ? C.primary : C.mutedFg }}>{tab.label}</div>
              {tab.badge > 0 && (
                <div style={{ position: "absolute", top: 3, right: tab.label === "Updates" ? 14 : 4, width: 16, height: 16, borderRadius: 8, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{tab.badge}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
