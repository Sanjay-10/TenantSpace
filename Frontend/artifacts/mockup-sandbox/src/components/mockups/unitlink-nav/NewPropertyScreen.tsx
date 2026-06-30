import React, { useState, useRef, useEffect } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", success: "#10B981", warning: "#F59E0B",
  danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

type TabKey = "rooms" | "rent" | "updates";
type UpdatesSubTab = "duties" | "requests" | "announcements";

const TABS: { key: TabKey; label: string }[] = [
  { key: "rooms", label: "Rooms" },
  { key: "rent", label: "Rent" },
  { key: "updates", label: "Updates" },
];

type Tenant = { initials: string; color: string; name: string };
type Room = { name: string; tenants: Tenant[]; rent: string; rentPaid: boolean };

const rooms: Room[] = [
  { name: "Room 1", tenants: [{ initials: "JD", color: "#2563EB", name: "Jess" }, { initials: "MC", color: "#06B6D4", name: "Marc" }, { initials: "S", color: "#F59E0B", name: "Sam" }], rent: "£800", rentPaid: true },
  { name: "Basement", tenants: [{ initials: "OW", color: "#10B981", name: "Owen" }], rent: "£950", rentPaid: true },
  { name: "Room 2", tenants: [{ initials: "JL", color: "#8B5CF6", name: "James" }], rent: "£800", rentPaid: false },
  { name: "Room 3", tenants: [{ initials: "PP", color: "#EC4899", name: "Priya" }, { initials: "TO", color: "#F97316", name: "Tom" }], rent: "£800", rentPaid: true },
];

function PropertyHero() {
  const collected = 3200, total = 4000;
  const pct = Math.round((collected / total) * 100);
  return (
    <div style={{ padding: "14px 16px 0" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 18, padding: "16px 18px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 110, height: 110, borderRadius: 55, border: "1.5px solid rgba(255,255,255,0.12)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.8, textTransform: "uppercase" }}>This Month</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>£{collected.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.75 }}>/ £{total.toLocaleString()}</span></div>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.18)" }}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{pct}% in</span>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)", overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "rgba(255,255,255,0.9)", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div><div style={{ fontSize: 10, opacity: 0.7 }}>Rooms</div><div style={{ fontSize: 16, fontWeight: 800 }}>{rooms.length}</div></div>
          <div><div style={{ fontSize: 10, opacity: 0.7 }}>Tenants</div><div style={{ fontSize: 16, fontWeight: 800 }}>{rooms.reduce((a, r) => a + r.tenants.length, 0)}</div></div>
        </div>
      </div>
    </div>
  );
}

function RoomsTab() {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PropertyHero />
        <div style={{ padding: "14px 16px 90px", display: "flex", flexDirection: "column", gap: 10 }}>
          {rooms.map(r => (
            <div key={r.name} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 18, color: C.primary }}>▦</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.fg }}>{r.name}</div>
                <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>{r.tenants.length} {r.tenants.length === 1 ? "Tenant" : "Tenants"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "row-reverse", marginRight: 4 }}>
                {[...r.tenants].reverse().map((t, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 14, background: t.color, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", marginLeft: i === r.tenants.length - 1 ? 0 : -10 }}>{t.initials}</div>
                ))}
              </div>
              <div style={{ fontSize: 18, color: C.border }}>›</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
        <button style={{ pointerEvents: "auto", padding: "13px 26px", borderRadius: 28, background: C.primary, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 20px rgba(37,99,235,0.45)" }}>
          <span style={{ fontSize: 18 }}>+</span> Add Room
        </button>
      </div>
    </div>
  );
}

function RentTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", flex: 1 }}>
      <PropertyHero />
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.fg }}>📤 Send Reminder</button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: C.primary, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>+ Record Payment</button>
        </div>
        {rooms.map(r => {
          const paid = r.rentPaid;
          return (
            <div key={r.name} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 16, color: C.primary }}>▦</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>{r.tenants.length} {r.tenants.length === 1 ? "tenant" : "tenants"} · {r.rent}/mo</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: paid ? "#D1FAE5" : "#FEF3C7", color: paid ? "#065F46" : "#92400E" }}>{paid ? "Paid" : "Pending"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Updates sub-tabs ──────────────────────────────────────────────

type ChoreStatus = "pending" | "done" | "missed";
type ChoreRotation = { name: string; initials: string; color: string; room: string };
type Chore = {
  id: string;
  name: string;
  icon: string;
  days: string[];
  freq: string;
  status: ChoreStatus;
  current: ChoreRotation;
  rotation: ChoreRotation[];
};

function DutiesSubTab() {
  const [chores, setChores] = useState<Chore[]>([
    {
      id: "kitchen", name: "Kitchen", icon: "🍳", days: ["Mon"], freq: "Weekly", status: "done",
      current: { name: "Jess", initials: "JD", color: "#2563EB", room: "Room 1" },
      rotation: [
        { name: "Jess",  initials: "JD", color: "#2563EB", room: "Room 1" },
        { name: "Marc",  initials: "MO", color: "#8B5CF6", room: "Room 1" },
        { name: "James", initials: "JL", color: "#F97316", room: "Room 2" },
        { name: "Priya", initials: "PS", color: "#10B981", room: "Room 3" },
      ],
    },
    {
      id: "bathroom", name: "Bathroom", icon: "🚿", days: ["Mon", "Thu"], freq: "Weekly", status: "pending",
      current: { name: "James", initials: "JL", color: "#F97316", room: "Room 2" },
      rotation: [
        { name: "James", initials: "JL", color: "#F97316", room: "Room 2" },
        { name: "Tom",   initials: "TR", color: "#EF4444", room: "Room 3" },
        { name: "Owen",  initials: "OT", color: "#64748B", room: "Basement" },
      ],
    },
    {
      id: "bins", name: "Bins", icon: "🗑️", days: ["Sun"], freq: "Weekly", status: "missed",
      current: { name: "Owen", initials: "OT", color: "#64748B", room: "Basement" },
      rotation: [
        { name: "Owen",  initials: "OT", color: "#64748B", room: "Basement" },
        { name: "Priya", initials: "PS", color: "#10B981", room: "Room 3" },
        { name: "Marc",  initials: "MO", color: "#8B5CF6", room: "Room 1" },
      ],
    },
    {
      id: "hallway", name: "Hallway", icon: "🧹", days: ["Fri"], freq: "Weekly", status: "pending",
      current: { name: "Tom", initials: "TR", color: "#EF4444", room: "Room 3" },
      rotation: [
        { name: "Tom",   initials: "TR", color: "#EF4444", room: "Room 3" },
        { name: "Jess",  initials: "JD", color: "#2563EB", room: "Room 1" },
        { name: "Owen",  initials: "OT", color: "#64748B", room: "Basement" },
        { name: "James", initials: "JL", color: "#F97316", room: "Room 2" },
      ],
    },
  ]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusStyle: Record<ChoreStatus, { bg: string; fg: string; label: string }> = {
    pending: { bg: C.muted,    fg: C.mutedFg,  label: "Pending"  },
    done:    { bg: "#D1FAE5",  fg: "#065F46",  label: "Done ✓"   },
    missed:  { bg: "#FEE2E2",  fg: "#991B1B",  label: "Missed"   },
  };

  const doneCount = chores.filter(c => c.status === "done").length;

  return (
    <div style={{ padding: "14px 16px 20px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>

      {/* Week header */}
      <div style={{ background: C.accent, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>This Week</div>
          <div style={{ fontSize: 11, color: "#1D4ED8", marginTop: 2 }}>29 Apr – 4 May 2026</div>
        </div>
        <div style={{ padding: "4px 12px", borderRadius: 20, background: C.primary }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{doneCount}/{chores.length} done</span>
        </div>
      </div>

      {/* + Assign Chore */}
      <button style={{ background: C.primary, border: "none", borderRadius: 14, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        + Assign Chore
      </button>

      {/* Chore cards */}
      {chores.map(chore => {
        const ss = statusStyle[chore.status];
        const isExpanded = expanded === chore.id;
        return (
          <div key={chore.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${chore.status === "done" ? "#D1FAE5" : chore.status === "missed" ? "#FEE2E2" : C.border}`, overflow: "hidden" }}>

            {/* Main row */}
            <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              onClick={() => setExpanded(isExpanded ? null : chore.id)}>

              {/* Icon */}
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{chore.icon}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.fg }}>{chore.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: ss.bg, color: ss.fg }}>{ss.label}</span>
                </div>
                {/* Schedule */}
                <div style={{ fontSize: 11, color: C.mutedFg }}>{chore.freq} · {chore.days.join(", ")}</div>
              </div>

              {/* Current assignee */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: chore.current.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{chore.current.initials}</div>
                <div style={{ fontSize: 9, color: C.mutedFg, fontWeight: 600 }}>{chore.current.name}</div>
              </div>

              {/* Chevron */}
              <div style={{ fontSize: 12, color: C.mutedFg, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
            </div>

            {/* Expanded: rotation cycle */}
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 14px", background: C.muted }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Rotation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {chore.rotation.map((p, i) => {
                    const isCurrent = p.initials === chore.current.initials;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: isCurrent ? C.primary : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: isCurrent ? "#fff" : C.mutedFg, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ width: 26, height: 26, borderRadius: 13, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0, border: isCurrent ? `2px solid ${C.primary}` : "2px solid transparent" }}>{p.initials}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? C.primary : C.fg }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: C.mutedFg }}> · {p.room}</span>
                        </div>
                        {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: C.accent, padding: "2px 8px", borderRadius: 20 }}>This week</span>}
                      </div>
                    );
                  })}
                </div>
                {/* Edit / Delete */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, fontSize: 12, fontWeight: 700, color: C.fg, cursor: "pointer" }}>Edit</button>
                  <button style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#FEE2E2", fontSize: 12, fontWeight: 700, color: "#EF4444", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

function RequestsSubTab() {
  type Status = "open" | "in progress" | "resolved";
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const reqs = [
    { title: "Boiler not heating", room: "Room 2 · James", initials: "JL", color: "#8B5CF6", priority: "urgent", time: "2h ago" },
    { title: "WiFi drops in evenings", room: "Room 3 · Tom", initials: "TO", color: "#F97316", priority: "normal", time: "1d ago" },
    { title: "Bathroom tap dripping", room: "Room 2 · James", initials: "JL", color: "#8B5CF6", priority: "low", time: "3d ago" },
    { title: "Window latch broken", room: "Room 1 · Jess", initials: "JD", color: "#2563EB", priority: "low", time: "5d ago" },
  ];

  const priorityStyle = (p: string) => p === "urgent" ? { bg: "#FEE2E2", fg: "#991B1B" } : p === "normal" ? { bg: "#FEF3C7", fg: "#92400E" } : { bg: C.muted, fg: C.mutedFg };

  const statusStyle: Record<Status, { bg: string; fg: string }> = {
    "open":        { bg: C.muted,    fg: C.mutedFg },
    "in progress": { bg: "#FEF3C7",  fg: "#92400E"  },
    "resolved":    { bg: "#D1FAE5",  fg: "#065F46"  },
  };

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      {reqs.map(r => {
        const status: Status = statuses[r.title] ?? "open";
        const ps = priorityStyle(r.priority);
        const ss = statusStyle[status];
        return (
          <div key={r.title} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{r.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>{r.title}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: ps.bg, color: ps.fg, flexShrink: 0 }}>{r.priority}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 11, color: C.mutedFg }}>{r.room} · {r.time}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: ss.bg, color: ss.fg }}>{status}</span>
                </div>
              </div>
            </div>
            {status !== "resolved" && (
              <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setStatuses(s => ({ ...s, [r.title]: "in progress" }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${C.border}`, background: status === "in progress" ? "#FEF3C7" : C.card, fontSize: 12, fontWeight: 700, color: status === "in progress" ? "#92400E" : C.fg, cursor: "pointer" }}>
                  In Progress
                </button>
                <button
                  onClick={() => setStatuses(s => ({ ...s, [r.title]: "resolved" }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: C.primary, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                  Resolved ✓
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnnouncementsSubTab() {
  const posts = [
    { title: "Boiler service next Tuesday", body: "Engineers will visit 9am–12pm. Please ensure access to your room.", time: "Today, 9:00 AM", expiresIn: "5 days left", views: "3 of 4 read" },
    { title: "Bin collection reminder", body: "Put bins out Sunday evening — collection is Monday morning.", time: "3 days ago", expiresIn: "Expired", views: "4 of 4 read" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      <button style={{ width: "100%", padding: "13px", borderRadius: 14, background: C.primary, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>+</span> New Post
      </button>
      {posts.map(p => (
        <div key={p.title} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "14px 16px", opacity: p.expiresIn === "Expired" ? 0.7 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📢</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.mutedFg }}>{p.time}</div></div>
            <div style={{ padding: "2px 8px", borderRadius: 20, background: p.expiresIn === "Expired" ? C.muted : "#ECFDF5" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: p.expiresIn === "Expired" ? C.mutedFg : "#065F46" }}>{p.expiresIn}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontSize: 12, color: C.mutedFg, lineHeight: 1.5, marginBottom: 10 }}>{p.body}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.mutedFg }}>👁 {p.views}</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 700, color: C.mutedFg, cursor: "pointer" }}>Edit</button>
              <button style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 700, color: C.danger, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpdatesTab() {
  const [subTab, setSubTab] = useState<UpdatesSubTab>("duties");
  const subTabs: { key: UpdatesSubTab; label: string; badge?: number }[] = [
    { key: "duties", label: "Duties" },
    { key: "requests", label: "Requests", badge: 3 },
    { key: "announcements", label: "Announcements" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Sub-tab bar */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", flexShrink: 0 }}>
        <div style={{ background: C.muted, borderRadius: 12, padding: 3, display: "flex", gap: 2 }}>
          {subTabs.map(st => {
            const isActive = st.key === subTab;
            return (
              <button key={st.key} onClick={() => setSubTab(st.key)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", cursor: "pointer", boxShadow: isActive ? "0 1px 5px rgba(15,23,42,0.08)" : "none", position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? C.primary : C.mutedFg }}>{st.label}</div>
                {st.badge && !isActive && (
                  <div style={{ position: "absolute", top: 2, right: 4, width: 14, height: 14, borderRadius: 7, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{st.badge}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {subTab === "duties" && <DutiesSubTab />}
      {subTab === "requests" && <RequestsSubTab />}
      {subTab === "announcements" && <AnnouncementsSubTab />}
    </div>
  );
}

// ── Contacts menu ─────────────────────────────────────────────────

type ContactEntry = { id: number; title: string; content: string };

function contactIcon(content: string): string {
  const v = content.toLowerCase();
  if (v.includes("@")) return "✉️";
  if (v.match(/^\+?[\d\s\-()]{6,}/)) return "📞";
  if (v.includes("e-transfer") || v.includes("etransfer") || v.includes("interac")) return "💸";
  return "🔗";
}

const DEFAULT_CONTACTS: ContactEntry[] = [
  { id: 1, title: "City Gas", content: "0800 111 222" },
  { id: 2, title: "SafeElec Ltd", content: "07700 900 123" },
  { id: 3, title: "Bob's Plumbing", content: "07700 900 456" },
];

function ContactsMenu({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<ContactEntry[]>(DEFAULT_CONTACTS);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (adding && titleRef.current) titleRef.current.focus(); }, [adding]);

  function saveContact() {
    if (!title.trim() || !content.trim()) return;
    setList(prev => [...prev, { id: Date.now(), title: title.trim(), content: content.trim() }]);
    setTitle(""); setContent(""); setAdding(false);
  }

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: "flex", flexDirection: "column" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(15,23,42,0.4)" }} />
      <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "20px 20px 34px", maxHeight: "82%", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.fg }}>Property Contacts</div>
          {!adding && <button onClick={() => setAdding(true)} style={{ padding: "6px 14px", borderRadius: 20, background: C.accent, border: `1px solid #BFDBFE`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.primary }}>+ Add</button>}
        </div>
        <div style={{ fontSize: 12, color: C.mutedFg, marginBottom: 14, lineHeight: 1.5 }}>
          These contacts are visible to all tenants across every room in this property.
        </div>
        {adding && (
          <div style={{ background: C.muted, borderRadius: 14, padding: "14px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.fg }}>New Contact</div>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. Plumber)" style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: C.card, outline: "none" }} />
            <input value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => e.key === "Enter" && saveContact()} placeholder="Phone, email, e-transfer ID…" style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: C.card, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAdding(false); setTitle(""); setContent(""); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.mutedFg }}>Cancel</button>
              <button onClick={saveContact} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: C.primary, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff" }}>Save</button>
            </div>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {list.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{contactIcon(c.content)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.fg }}>{c.title}</div>
                <div style={{ fontSize: 12, color: C.mutedFg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.content}</div>
              </div>
              <button onClick={() => setList(prev => prev.filter(x => x.id !== c.id))} style={{ padding: "4px 8px", border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: C.mutedFg }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Add Co-owner", icon: "👤+", color: C.fg },
            { label: "Edit Property", icon: "✏️", color: C.fg },
            { label: "Delete Property", icon: "🗑️", color: C.danger },
          ].map(({ label, icon, color }) => (
            <button key={label} onClick={onClose} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.muted, cursor: "pointer", fontSize: 14, fontWeight: 600, color, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────

export function NewPropertyScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("rooms");
  const [showContacts, setShowContacts] = useState(false);

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "12px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: C.mutedFg }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.fg, letterSpacing: -0.4 }}>Maple Grove</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>12 Maple St, London E1 4RD</div>
          </div>
          <button onClick={() => setShowContacts(true)} style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontSize: 14, color: C.mutedFg }}>⋮</button>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {activeTab === "rooms" && <RoomsTab />}
        {activeTab === "rent" && <RentTab />}
        {activeTab === "updates" && <UpdatesTab />}

        {/* Floating chat FAB */}
        <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <button style={{ width: 54, height: 54, borderRadius: 27, background: C.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,99,235,0.45)", position: "relative" }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: 9, background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>2</span>
            </div>
          </button>
          <div style={{ fontSize: 9, color: C.mutedFg, fontWeight: 600, letterSpacing: 0.3 }}>Chats</div>
        </div>
      </div>

      {showContacts && <ContactsMenu onClose={() => setShowContacts(false)} />}

      {/* Bottom pill tabs */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "10px 12px 20px", flexShrink: 0 }}>
        <div style={{ background: C.muted, borderRadius: 14, padding: 4, display: "flex", gap: 3 }}>
          {TABS.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: isActive ? C.card : "transparent", cursor: "pointer", boxShadow: isActive ? "0 1px 6px rgba(15,23,42,0.08)" : "none", position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? C.primary : C.mutedFg }}>{tab.label}</div>
                {tab.key === "updates" && !isActive && (
                  <div style={{ position: "absolute", top: 3, right: 6, width: 14, height: 14, borderRadius: 7, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>3</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
