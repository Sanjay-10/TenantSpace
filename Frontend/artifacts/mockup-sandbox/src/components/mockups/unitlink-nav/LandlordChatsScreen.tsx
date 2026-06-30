import React from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", success: "#10B981", danger: "#EF4444", warning: "#F59E0B",
  g1: "#1D4ED8", g3: "#3B82F6",
};

type Tenant = { initials: string; color: string; name: string };
type RoomChat = {
  id: string;
  room: string;
  tenants: Tenant[];
  lastSender: string;       // "You" or tenant name
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
};

const chats: RoomChat[] = [
  {
    id: "r2", room: "Room 2",
    tenants: [{ initials: "JL", color: "#8B5CF6", name: "James" }],
    lastSender: "James", lastMessage: "The boiler still isn't heating properly…",
    time: "2m", unread: 2, online: true,
  },
  {
    id: "r1", room: "Room 1",
    tenants: [
      { initials: "JD", color: "#2563EB", name: "Jess" },
      { initials: "MC", color: "#06B6D4", name: "Marc" },
      { initials: "S", color: "#F59E0B", name: "Sam" },
    ],
    lastSender: "You", lastMessage: "Thanks, I'll send the plumber tomorrow",
    time: "1h", unread: 0,
  },
  {
    id: "rb", room: "Basement",
    tenants: [{ initials: "OW", color: "#10B981", name: "Owen" }],
    lastSender: "Owen", lastMessage: "Rent transferred — receipt attached",
    time: "3h", unread: 0,
  },
  {
    id: "r3", room: "Room 3",
    tenants: [
      { initials: "PP", color: "#EC4899", name: "Priya" },
      { initials: "TO", color: "#F97316", name: "Tom" },
    ],
    lastSender: "Priya", lastMessage: "Sounds good, thanks Sarah!",
    time: "Yesterday", unread: 0,
  },
];

function AvatarStack({ tenants }: { tenants: Tenant[] }) {
  // Single tenant: solo circle. Multiple: overlapping mini stack.
  if (tenants.length === 1) {
    return (
      <div style={{ width: 48, height: 48, borderRadius: 24, background: tenants[0].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
        {tenants[0].initials}
      </div>
    );
  }
  // 2+ tenants: stacked
  return (
    <div style={{ width: 48, height: 48, position: "relative" }}>
      {tenants.slice(0, 3).map((t, i) => {
        const size = tenants.length === 2 ? 32 : 28;
        const positions = tenants.length === 2
          ? [{ top: 0, left: 0 }, { bottom: 0, right: 0 }]
          : [{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 10 }];
        const pos = positions[i];
        return (
          <div key={i} style={{ position: "absolute", ...pos, width: size, height: size, borderRadius: size / 2, background: t.color, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>
            {t.initials}
          </div>
        );
      })}
    </div>
  );
}

export function LandlordChatsScreen() {
  const totalUnread = chats.reduce((a, c) => a + c.unread, 0);

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.fg }}>●●●</span>
          <span style={{ fontSize: 11, color: C.fg }}>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "12px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: C.mutedFg }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.fg, letterSpacing: -0.4 }}>Room Chats</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Maple Grove · {chats.length} rooms{totalUnread > 0 ? ` · ${totalUnread} unread` : ""}</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: C.mutedFg }}>🔍</div>
        </div>
      </div>

      {/* Broadcast banner */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <button style={{ width: "100%", background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 14, padding: "12px 14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📣</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Message all tenants</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>Broadcast to every room in this property</div>
          </div>
          <span style={{ fontSize: 18, opacity: 0.9 }}>›</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 4px", flexShrink: 0 }}>
        {[
          { k: "All", n: chats.length, active: true },
          { k: "Unread", n: totalUnread },
        ].map(f => (
          <button key={f.k} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${f.active ? C.primary : C.border}`, background: f.active ? C.primary : C.card, color: f.active ? "#fff" : C.mutedFg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {f.k}{f.n > 0 ? ` · ${f.n}` : ""}
          </button>
        ))}
      </div>

      {/* Room chat list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0 16px" }}>
        {chats.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: c.unread > 0 ? "#FAFBFD" : "transparent" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <AvatarStack tenants={c.tenants} />
              {c.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, background: C.success, border: "2px solid #fff" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: c.unread > 0 ? 800 : 700, color: C.fg }}>{c.room}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedFg, padding: "2px 6px", borderRadius: 6, background: C.muted, flexShrink: 0 }}>
                    {c.tenants.length === 1 ? "1 tenant" : `${c.tenants.length} tenants`}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: c.unread > 0 ? C.primary : C.mutedFg, fontWeight: c.unread > 0 ? 700 : 500, flexShrink: 0 }}>{c.time}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 13, color: c.unread > 0 ? C.fg : C.mutedFg, fontWeight: c.unread > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                  <span style={{ fontWeight: 700 }}>{c.lastSender}:</span> {c.lastMessage}
                </div>
                {c.unread > 0 && (
                  <div style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{c.unread}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating compose */}
      <div style={{ position: "absolute", bottom: 24, right: 16, zIndex: 10 }}>
        <button style={{ width: 54, height: 54, borderRadius: 27, background: C.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(37,99,235,0.45), 0 2px 6px rgba(37,99,235,0.3)" }}>
          <span style={{ fontSize: 22, color: "#fff" }}>✎</span>
        </button>
      </div>
    </div>
  );
}
