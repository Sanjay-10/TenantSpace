import React, { useState } from "react";

// ─── Premium cross-platform design tokens ─────────────────────────────────
const P = {
  bgGrad: "linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 35%, #F5F8FF 70%, #F8FAFC 100%)",
  card:   "#FFFFFF",
  fg:     "#0F172A",
  fg2:    "#1E293B",
  mutedFg:"#64748B",
  border: "rgba(148,163,184,0.18)",
  cardShadow: "0 2px 14px rgba(15,23,42,0.07), 0 0 0 1px rgba(148,163,184,0.12)",
  primary:"#2563EB",
  accent: "#EFF6FF",
  g1:     "#1D4ED8",
  g3:     "#3B82F6",
  success:"#10B981",
  warning:"#F59E0B",
  danger: "#EF4444",
  muted:  "#F1F5F9",
  glassBg:    "rgba(255,255,255,0.72)",
  glassBlur:  "blur(20px)",
  glassBorder:"rgba(255,255,255,0.55)",
  tabGlass:   "rgba(255,255,255,0.55)",
};

type TabKey = "rooms" | "rent" | "updates";
type UpdatesSubTab = "duties" | "requests" | "announcements";
type ChoreStatus = "pending" | "done" | "missed";
type ChoreRotation = { name: string; initials: string; color: string; room: string };
type Chore = { id: string; name: string; icon: string; days: string[]; freq: string; status: ChoreStatus; current: ChoreRotation; rotation: ChoreRotation[] };

const rooms = [
  { name: "Room 1",   tenants: [{ initials: "JD", color: "#2563EB" }, { initials: "MC", color: "#06B6D4" }, { initials: "S", color: "#F59E0B" }], rent: "£800", rentPaid: true  },
  { name: "Basement", tenants: [{ initials: "OW", color: "#10B981" }], rent: "£950", rentPaid: true  },
  { name: "Room 2",   tenants: [{ initials: "JL", color: "#8B5CF6" }], rent: "£800", rentPaid: false },
  { name: "Room 3",   tenants: [{ initials: "PP", color: "#EC4899" }, { initials: "TO", color: "#F97316" }], rent: "£800", rentPaid: true  },
];

// ─── Shared Card wrapper ───────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: P.card, borderRadius: 20, boxShadow: P.cardShadow, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

// ─── Hero (rent summary) ───────────────────────────────────────────────────
function PropertyHero() {
  const collected = 3200, total = 4000, pct = Math.round((collected / total) * 100);
  return (
    <div style={{ padding: "14px 16px 0" }}>
      <div style={{ background: `linear-gradient(135deg, ${P.g1}, ${P.g3})`, borderRadius: 22, padding: "20px 20px 18px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 8px 30px rgba(37,99,235,0.35)" }}>
        <div style={{ position: "absolute", right: -24, top: -24, width: 130, height: 130, borderRadius: 65, border: "1.5px solid rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: -40, bottom: -50, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -30, width: 80, height: 80, borderRadius: 40, border: "1px solid rgba(255,255,255,0.08)" }} />

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.8, textTransform: "uppercase", marginBottom: 4 }}>May 2026 · Rent</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.8, marginBottom: 2 }}>
          £{collected.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}>/ £{total.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 14 }}>3 of 4 rooms paid</div>

        {/* Progress */}
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.2)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "rgba(255,255,255,0.88)", borderRadius: 3 }} />
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div><div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 0.5 }}>ROOMS</div><div style={{ fontSize: 18, fontWeight: 800 }}>{rooms.length}</div></div>
          <div><div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 0.5 }}>TENANTS</div><div style={{ fontSize: 18, fontWeight: 800 }}>{rooms.reduce((a, r) => a + r.tenants.length, 0)}</div></div>
          <div style={{ marginLeft: "auto" }}>
            <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}% collected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rooms tab ─────────────────────────────────────────────────────────────
function RoomsTab() {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PropertyHero />
        <div style={{ padding: "14px 16px 100px", display: "flex", flexDirection: "column", gap: 10 }}>
          {rooms.map(r => (
            <Card key={r.name}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: P.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>🚪</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: P.fg }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: P.mutedFg, marginTop: 2 }}>{r.tenants.length} Tenant{r.tenants.length !== 1 ? "s" : ""} · {r.rent}/mo</div>
                </div>
                <div style={{ display: "flex", flexDirection: "row-reverse" }}>
                  {[...r.tenants].reverse().map((t, i) => (
                    <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: t.color, border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", marginLeft: i === r.tenants.length - 1 ? 0 : -10 }}>{t.initials}</div>
                  ))}
                </div>
                <div style={{ fontSize: 16, color: P.mutedFg, marginLeft: 4 }}>›</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Floating FAB */}
      <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
        <button style={{ pointerEvents: "auto", padding: "14px 28px", borderRadius: 30, background: P.primary, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 24px rgba(37,99,235,0.45)", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add Room
        </button>
      </div>
    </div>
  );
}

// ─── Rent tab ──────────────────────────────────────────────────────────────
function RentTab() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <PropertyHero />
      <div style={{ padding: "14px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1px solid ${P.border}`, background: P.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: P.fg, boxShadow: "0 1px 6px rgba(15,23,42,0.05)" }}>📤 Send Reminder</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: P.primary, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>+ Record Payment</button>
        </div>
        {rooms.map(r => (
          <Card key={r.name}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: P.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 19 }}>🚪</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.fg }}>{r.name}</div>
                <div style={{ fontSize: 11, color: P.mutedFg, marginTop: 2 }}>{r.tenants.length} tenant{r.tenants.length !== 1 ? "s" : ""} · {r.rent}/mo</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: r.rentPaid ? "#D1FAE5" : "#FEF3C7", color: r.rentPaid ? "#065F46" : "#92400E" }}>
                {r.rentPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Duties sub-tab ────────────────────────────────────────────────────────
function DutiesSubTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const chores: Chore[] = [
    { id: "kitchen",  name: "Kitchen",  icon: "🍳", days: ["Mon"],        freq: "Weekly", status: "done",    current: { name: "Jess",  initials: "JD", color: "#2563EB", room: "Room 1" }, rotation: [{ name: "Jess", initials: "JD", color: "#2563EB", room: "Room 1" }, { name: "Marc", initials: "MO", color: "#8B5CF6", room: "Room 1" }, { name: "James", initials: "JL", color: "#F97316", room: "Room 2" }] },
    { id: "bathroom", name: "Bathroom", icon: "🚿", days: ["Mon", "Thu"], freq: "Weekly", status: "pending", current: { name: "James", initials: "JL", color: "#F97316", room: "Room 2" }, rotation: [{ name: "James", initials: "JL", color: "#F97316", room: "Room 2" }, { name: "Tom", initials: "TR", color: "#EF4444", room: "Room 3" }] },
    { id: "bins",     name: "Bins",     icon: "🗑️", days: ["Sun"],        freq: "Weekly", status: "missed",  current: { name: "Owen",  initials: "OT", color: "#64748B", room: "Basement" }, rotation: [{ name: "Owen", initials: "OT", color: "#64748B", room: "Basement" }, { name: "Priya", initials: "PS", color: "#10B981", room: "Room 3" }] },
    { id: "hallway",  name: "Hallway",  icon: "🧹", days: ["Fri"],        freq: "Weekly", status: "pending", current: { name: "Tom",   initials: "TR", color: "#EF4444", room: "Room 3" }, rotation: [{ name: "Tom", initials: "TR", color: "#EF4444", room: "Room 3" }, { name: "Jess", initials: "JD", color: "#2563EB", room: "Room 1" }] },
  ];

  const statusStyle: Record<ChoreStatus, { bg: string; fg: string; label: string }> = {
    pending: { bg: "#F1F5F9", fg: "#64748B", label: "Pending"  },
    done:    { bg: "#D1FAE5", fg: "#065F46", label: "Done ✓"   },
    missed:  { bg: "#FEE2E2", fg: "#991B1B", label: "Missed"   },
  };

  const doneCount = chores.filter(c => c.status === "done").length;

  return (
    <div style={{ padding: "14px 16px 20px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      {/* Week banner */}
      <div style={{ background: P.accent, borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(37,99,235,0.1)" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.primary }}>This Week</div>
          <div style={{ fontSize: 11, color: "#1D4ED8", marginTop: 2 }}>29 Apr – 4 May 2026</div>
        </div>
        <div style={{ padding: "5px 13px", borderRadius: 20, background: P.primary, boxShadow: "0 3px 10px rgba(37,99,235,0.3)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{doneCount}/{chores.length} done</span>
        </div>
      </div>

      <button style={{ background: P.primary, border: "none", borderRadius: 16, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.32)" }}>
        + Assign Chore
      </button>

      {chores.map(chore => {
        const ss = statusStyle[chore.status];
        const isExpanded = expanded === chore.id;
        return (
          <Card key={chore.id}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              onClick={() => setExpanded(isExpanded ? null : chore.id)}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: chore.status === "done" ? "#D1FAE5" : chore.status === "missed" ? "#FEE2E2" : P.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{chore.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: P.fg }}>{chore.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ss.bg, color: ss.fg }}>{ss.label}</span>
                </div>
                <div style={{ fontSize: 11, color: P.mutedFg }}>{chore.freq} · {chore.days.join(", ")}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: chore.current.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{chore.current.initials}</div>
                <div style={{ fontSize: 9, color: P.mutedFg, fontWeight: 600 }}>{chore.current.name}</div>
              </div>
              <div style={{ fontSize: 11, color: P.mutedFg, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginLeft: 2 }}>▼</div>
            </div>
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${P.border}`, padding: "12px 16px", background: "#F8FAFC" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: P.mutedFg, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Rotation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {chore.rotation.map((p, i) => {
                    const isCurrent = p.initials === chore.current.initials;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: isCurrent ? P.primary : P.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: isCurrent ? "#fff" : P.mutedFg, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ width: 28, height: 28, borderRadius: 14, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0, border: isCurrent ? `2.5px solid ${P.primary}` : "2.5px solid transparent" }}>{p.initials}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? P.primary : P.fg }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: P.mutedFg }}> · {p.room}</span>
                        </div>
                        {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: P.primary, background: P.accent, padding: "3px 9px", borderRadius: 20 }}>This week</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ flex: 1, padding: "9px", borderRadius: 12, border: `1px solid ${P.border}`, background: P.card, fontSize: 12, fontWeight: 700, color: P.fg, cursor: "pointer" }}>Edit</button>
                  <button style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", background: "#FEE2E2", fontSize: 12, fontWeight: 700, color: "#EF4444", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Requests sub-tab ──────────────────────────────────────────────────────
function RequestsSubTab() {
  type Status = "open" | "in progress" | "resolved";
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const reqs = [
    { title: "Boiler not heating",     room: "Room 2 · James", initials: "JL", color: "#8B5CF6", priority: "urgent", time: "2h ago" },
    { title: "WiFi drops in evenings", room: "Room 3 · Tom",   initials: "TO", color: "#F97316", priority: "normal", time: "1d ago" },
    { title: "Bathroom tap dripping",  room: "Room 2 · James", initials: "JL", color: "#8B5CF6", priority: "low",    time: "3d ago" },
  ];
  const priorityStyle = (p: string) => p === "urgent" ? { bg: "#FEE2E2", fg: "#991B1B" } : p === "normal" ? { bg: "#FEF3C7", fg: "#92400E" } : { bg: P.muted, fg: P.mutedFg };
  const statusStyle: Record<Status, { bg: string; fg: string }> = {
    "open":        { bg: P.muted,   fg: P.mutedFg  },
    "in progress": { bg: "#FEF3C7", fg: "#92400E"  },
    "resolved":    { bg: "#D1FAE5", fg: "#065F46"  },
  };
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      {reqs.map(r => {
        const status: Status = statuses[r.title] ?? "open";
        const ps = priorityStyle(r.priority);
        const ss = statusStyle[status];
        return (
          <Card key={r.title}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: status !== "resolved" ? 12 : 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 17, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 3px 10px ${r.color}55` }}>{r.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: P.fg }}>{r.title}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ps.bg, color: ps.fg, flexShrink: 0 }}>{r.priority}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: P.mutedFg }}>{r.room} · {r.time}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: ss.bg, color: ss.fg }}>{status}</span>
                  </div>
                </div>
              </div>
              {status !== "resolved" && (
                <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${P.border}` }}>
                  <button onClick={() => setStatuses(s => ({ ...s, [r.title]: "in progress" }))}
                    style={{ flex: 1, padding: "9px", borderRadius: 12, border: `1px solid ${P.border}`, background: status === "in progress" ? "#FEF3C7" : P.card, fontSize: 12, fontWeight: 700, color: status === "in progress" ? "#92400E" : P.fg, cursor: "pointer" }}>
                    In Progress
                  </button>
                  <button onClick={() => setStatuses(s => ({ ...s, [r.title]: "resolved" }))}
                    style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", background: P.primary, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 3px 10px rgba(37,99,235,0.25)" }}>
                    Resolved ✓
                  </button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Announcements sub-tab ─────────────────────────────────────────────────
function AnnouncementsSubTab() {
  const posts = [
    { title: "Boiler service next Tuesday", body: "Engineers will visit 9am–12pm. Please ensure access.", time: "Today, 9:00 AM", expires: "5 days left", views: "3 of 4 read" },
    { title: "Bin collection reminder",     body: "Put bins out Sunday evening — collection Monday morning.", time: "3 days ago",   expires: "Expired",    views: "4 of 4 read" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: P.primary, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
        + New Post
      </button>
      {posts.map(p => (
        <Card key={p.title} style={{ opacity: p.expires === "Expired" ? 0.65 : 1 }}>
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: P.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📢</div>
              <div style={{ flex: 1, fontSize: 11, color: P.mutedFg }}>{p.time}</div>
              <div style={{ padding: "3px 10px", borderRadius: 20, background: p.expires === "Expired" ? P.muted : "#ECFDF5" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: p.expires === "Expired" ? P.mutedFg : "#065F46" }}>{p.expires}</span>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.fg, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: P.mutedFg, lineHeight: 1.6, marginBottom: 12 }}>{p.body}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 11, color: P.mutedFg }}>👁 {p.views}</span>
              <div style={{ display: "flex", gap: 14 }}>
                <button style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 700, color: P.mutedFg, cursor: "pointer" }}>Edit</button>
                <button style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 700, color: P.danger, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Updates tab ───────────────────────────────────────────────────────────
function UpdatesTab() {
  const [subTab, setSubTab] = useState<UpdatesSubTab>("duties");
  const subTabs: { key: UpdatesSubTab; label: string; badge?: number }[] = [
    { key: "duties", label: "Duties" },
    { key: "requests", label: "Requests", badge: 3 },
    { key: "announcements", label: "Posts" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Glass pill segment control */}
      <div style={{ padding: "12px 16px 10px", flexShrink: 0 }}>
        <div style={{ background: P.tabGlass, backdropFilter: P.glassBlur, borderRadius: 16, padding: 4, display: "flex", gap: 2, border: `1px solid ${P.glassBorder}`, boxShadow: "0 2px 10px rgba(15,23,42,0.06)" }}>
          {subTabs.map(st => {
            const isActive = st.key === subTab;
            return (
              <button key={st.key} onClick={() => setSubTab(st.key)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", background: isActive ? "#fff" : "transparent", cursor: "pointer", boxShadow: isActive ? "0 2px 8px rgba(15,23,42,0.1)" : "none", position: "relative", transition: "all 0.15s" }}>
                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? P.primary : P.mutedFg }}>{st.label}</div>
                {st.badge && !isActive && (
                  <div style={{ position: "absolute", top: 2, right: 6, width: 14, height: 14, borderRadius: 7, background: P.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{st.badge}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {subTab === "duties"        && <DutiesSubTab />}
      {subTab === "requests"      && <RequestsSubTab />}
      {subTab === "announcements" && <AnnouncementsSubTab />}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function NewPropertyScreenPremium() {
  const [tab, setTab] = useState<TabKey>("rooms");

  const navTabs: { key: TabKey; label: string; icon: string; badge?: number }[] = [
    { key: "rooms",   label: "Rooms",   icon: "🚪" },
    { key: "rent",    label: "Rent",    icon: "💷" },
    { key: "updates", label: "Updates", icon: "📬", badge: 3 },
  ];

  // Bottom nav tabs (main app navigation)
  const bottomNav = [
    { icon: "🏠", label: "Home"     },
    { icon: "💬", label: "Chats"    },
    { icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ width: 390, height: 844, background: P.bgGrad, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: P.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: P.fg }}>●●●</span><span style={{ fontSize: 11, color: P.fg }}>🔋</span></div>
      </div>

      {/* Header — floating on gradient, no harsh border */}
      <div style={{ padding: "4px 16px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 16, color: P.mutedFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(15,23,42,0.08)" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: P.fg, letterSpacing: -0.5 }}>Maple Grove</div>
            <div style={{ fontSize: 12, color: P.mutedFg, marginTop: 1 }}>4 rooms · 7 tenants</div>
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, color: P.mutedFg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.08)" }}>⋮</button>
        </div>
      </div>

      {/* Glass pill tab selector */}
      <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
        <div style={{ background: P.tabGlass, backdropFilter: P.glassBlur, borderRadius: 16, padding: 5, display: "flex", gap: 2, border: `1px solid ${P.glassBorder}`, boxShadow: "0 4px 16px rgba(15,23,42,0.07)" }}>
          {navTabs.map(t => {
            const isActive = t.key === tab;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flex: 1, padding: "9px 6px", borderRadius: 11, border: "none", background: isActive ? "#fff" : "transparent", cursor: "pointer", boxShadow: isActive ? "0 3px 10px rgba(15,23,42,0.1)" : "none", position: "relative", transition: "all 0.18s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? P.primary : P.mutedFg }}>{t.label}</div>
                {t.badge && !isActive && (
                  <div style={{ position: "absolute", top: 4, right: 8, width: 14, height: 14, borderRadius: 7, background: P.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{t.badge}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "rooms"   && <RoomsTab />}
        {tab === "rent"    && <RentTab />}
        {tab === "updates" && <UpdatesTab />}
      </div>

      {/* Glass bottom tab bar */}
      <div style={{ background: "rgba(248,250,252,0.78)", backdropFilter: "blur(24px)", borderTop: "0.5px solid rgba(148,163,184,0.25)", paddingBottom: 20, paddingTop: 8, display: "flex", flexShrink: 0, boxShadow: "0 -1px 0 rgba(0,0,0,0.04)" }}>
        {bottomNav.map((n, i) => {
          const isActive = i === 0; // Home is active when on a property
          return (
            <button key={n.label}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 2px", background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 44, height: 30, borderRadius: 10, background: isActive ? P.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? P.primary : P.mutedFg }}>{n.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
