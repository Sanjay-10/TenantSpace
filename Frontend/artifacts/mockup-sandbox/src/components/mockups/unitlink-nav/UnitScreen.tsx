import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", success: "#10B981", warning: "#F59E0B",
  danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

type TabKey = "myroom" | "rent" | "updates" | "docs";
type UpdatesSubTab = "duties" | "requests" | "announcements";

const TABS: { key: TabKey; label: string }[] = [
  { key: "myroom", label: "My Room" },
  { key: "rent", label: "Rent" },
  { key: "updates", label: "Updates" },
  { key: "docs", label: "Docs" },
];

const contacts = [
  { name: "Bob's Plumbing", role: "Plumber", phone: "07700 900 456", icon: "🔧" },
  { name: "SafeElec Ltd", role: "Electrician", phone: "07700 900 123", icon: "⚡" },
  { name: "City Gas", role: "Utilities", phone: "0800 111 222", icon: "🔥" },
];

function MyRoomTab() {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 18, padding: "18px 20px", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.8, textTransform: "uppercase" }}>Your Room</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>Room 1B</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Maple Grove · Floor 1</div>
        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          <div><div style={{ fontSize: 11, opacity: 0.75 }}>Monthly Rent</div><div style={{ fontWeight: 700, fontSize: 16 }}>£800</div></div>
          <div><div style={{ fontSize: 11, opacity: 0.75 }}>Move-in</div><div style={{ fontWeight: 700, fontSize: 16 }}>Jan 2025</div></div>
          <div><div style={{ fontSize: 11, opacity: 0.75 }}>Status</div><div style={{ fontWeight: 700, fontSize: 14, color: "#FCD34D" }}>Active</div></div>
        </div>
      </div>

      {/* Chats */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>Chats</div>
        {[
          { name: "Sarah Mitchell", sub: "Your Landlord · Tap to message", time: "2h ago", badge: 1, badgeColor: C.primary, icon: "🏠", iconBg: C.accent, online: true },
          { name: "Maple Grove · All Tenants", sub: "Alice: Anyone else getting low hot water?", time: "45m ago", badge: 3, badgeColor: C.danger, icon: null, online: false },
        ].map((chat, idx) => (
          <div key={chat.name} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: idx === 0 ? 8 : 0, cursor: "pointer" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {chat.icon ? (
                <div style={{ width: 44, height: 44, borderRadius: 22, background: chat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{chat.icon}</div>
              ) : (
                <div style={{ width: 44, height: 44, position: "relative" }}>
                  {["JL", "PP", "TC"].map((ini, i) => (
                    <div key={ini} style={{ position: "absolute", width: 28, height: 28, borderRadius: 14, background: [C.accent, "#FEF3C7", "#F0FDF4"][i], border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", left: i * 10, top: i === 1 ? 8 : 2, zIndex: 3 - i }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: [C.primary, "#92400E", "#065F46"][i] }}>{ini}</span>
                    </div>
                  ))}
                </div>
              )}
              {chat.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7, background: C.success, border: "2px solid #fff" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{chat.name}</div>
              <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.sub}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: C.mutedFg }}>{chat.time}</span>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: chat.badgeColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{chat.badge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room details */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.fg, marginBottom: 6 }}>Room Details</div>
        {[["Lease end", "Dec 2025"], ["Deposit", "£800 (held)"], ["Wifi", "Included"], ["Bills", "Included"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingTop: 7, borderTop: `1px solid ${C.border}`, marginTop: 7 }}>
            <span style={{ fontSize: 12, color: C.mutedFg }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.fg }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Property contacts */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, paddingLeft: 2 }}>Property Contacts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contacts.map(c => (
            <div key={c.name} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.mutedFg }}>{c.role}</div>
              </div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{c.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* End tenancy */}
      <div style={{ marginTop: 8, paddingBottom: 8 }}>
        <button style={{ width: "100%", padding: "13px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.mutedFg }}>End Tenancy</span>
        </button>
        <div style={{ fontSize: 11, color: C.mutedFg, textAlign: "center", marginTop: 7 }}>Sends a move-out request to your landlord</div>
      </div>
    </div>
  );
}

function RentTab() {
  const payments = [
    { month: "May 2026", status: "pending", amount: "£800" },
    { month: "Apr 2026", status: "paid", amount: "£800" },
    { month: "Mar 2026", status: "paid", amount: "£800" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 18, padding: "18px 20px", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.8, textTransform: "uppercase" }}>May 2026</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>£800 <span style={{ fontSize: 15, opacity: 0.75, fontWeight: 400 }}>due</span></div>
        <button style={{ marginTop: 14, background: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: C.primary, cursor: "pointer" }}>Pay Now</button>
      </div>
      {payments.map(p => (
        <div key={p.month} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{p.month}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{p.amount}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: p.status === "paid" ? "#D1FAE5" : "#FEF3C7", color: p.status === "paid" ? "#065F46" : "#92400E" }}>
              {p.status === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocsTab() {
  const docs = [
    { name: "Tenancy Agreement", date: "Jan 2025", icon: "📄" },
    { name: "Room Inventory", date: "Jan 2025", icon: "📋" },
    { name: "Gas Safety Cert", date: "Dec 2024", icon: "📜" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
      {docs.map(d => (
        <div key={d.name} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{d.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.fg }}>{d.name}</div>
            <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 2 }}>{d.date}</div>
          </div>
          <span style={{ fontSize: 18, color: C.primary }}>↓</span>
        </div>
      ))}
    </div>
  );
}

type TenantChoreStatus = "mine-pending" | "mine-done" | "theirs-pending" | "theirs-done";
type TenantChore = { id: string; name: string; icon: string; days: string; freq: string; status: TenantChoreStatus; assignee: string; initials: string; color: string; room: string };

function DutiesSubTab() {
  const [chores, setChores] = useState<TenantChore[]>([
    { id: "kitchen", name: "Kitchen",  icon: "🍳", days: "Mon",      freq: "Weekly", status: "mine-done",     assignee: "You",   initials: "AT", color: "#2563EB", room: "Room 1" },
    { id: "bins",    name: "Bins",     icon: "🗑️", days: "Sun",      freq: "Weekly", status: "mine-pending",  assignee: "You",   initials: "AT", color: "#2563EB", room: "Room 1" },
    { id: "bathroom",name: "Bathroom", icon: "🚿", days: "Mon, Thu", freq: "Weekly", status: "theirs-pending",assignee: "James", initials: "JL", color: "#F97316", room: "Room 2" },
    { id: "hallway", name: "Hallway",  icon: "🧹", days: "Fri",      freq: "Weekly", status: "theirs-done",   assignee: "Tom",   initials: "TR", color: "#EF4444", room: "Room 3" },
  ]);

  function markDone(id: string) {
    setChores(prev => prev.map(c => c.id === id ? { ...c, status: "mine-done" as TenantChoreStatus } : c));
  }

  const myDone  = chores.filter(c => c.status === "mine-done").length;
  const myTotal = chores.filter(c => c.status === "mine-done" || c.status === "mine-pending").length;

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>

      {/* This week banner */}
      <div style={{ background: C.accent, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>This Week</div>
          <div style={{ fontSize: 11, color: "#1D4ED8", marginTop: 2 }}>29 Apr – 4 May 2026</div>
        </div>
        <div style={{ padding: "4px 12px", borderRadius: 20, background: C.primary }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{myDone}/{myTotal} your chores done</span>
        </div>
      </div>

      {chores.map(chore => {
        const isMine   = chore.status === "mine-pending" || chore.status === "mine-done";
        const isDone   = chore.status === "mine-done" || chore.status === "theirs-done";

        return (
          <div key={chore.id} style={{
            background: C.card,
            borderRadius: 14,
            border: `1.5px solid ${isDone ? "#D1FAE5" : isMine ? C.primary : C.border}`,
            overflow: "hidden",
          }}>
            <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 10 }}>

              {/* Icon */}
              <div style={{ width: 38, height: 38, borderRadius: 12, background: isDone ? "#D1FAE5" : isMine ? C.accent : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{chore.icon}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isDone ? C.mutedFg : C.fg, textDecoration: isDone ? "line-through" : "none" }}>{chore.name}</div>
                  {isMine && !isDone && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: C.primary, color: "#fff" }}>Your turn</span>}
                  {isDone && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#D1FAE5", color: "#065F46" }}>Done ✓</span>}
                </div>
                <div style={{ fontSize: 11, color: C.mutedFg }}>{chore.freq} · {chore.days}</div>
              </div>

              {/* Assignee avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: chore.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{chore.initials}</div>
                <div style={{ fontSize: 9, color: C.mutedFg, fontWeight: 600 }}>{chore.assignee}</div>
              </div>
            </div>

            {/* Mark Done — only for your pending chores */}
            {chore.status === "mine-pending" && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px" }}>
                <button onClick={() => markDone(chore.id)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Mark as Done ✓
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RequestsSubTab() {
  const reqs = [
    { title: "Boiler not heating", status: "in progress", time: "2h ago", priority: "urgent" },
    { title: "WiFi drops in evenings", status: "open", time: "1d ago", priority: "normal" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      <button style={{ background: C.primary, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        + New Request
      </button>
      {reqs.map(r => (
        <div key={r.title} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>{r.title}</div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: r.status === "in progress" ? "#FEF3C7" : C.muted, color: r.status === "in progress" ? "#92400E" : C.mutedFg }}>
              {r.status}
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.mutedFg }}>{r.time}</div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsSubTab() {
  const announcements = [
    { id: 1, from: "Sarah Mitchell", time: "Today, 9:00 AM", title: "Boiler inspection this Friday", body: "A technician will visit between 10am–12pm on Friday 3 May. Please ensure access to your room.", unread: true, expires: "3 days left" },
    { id: 2, from: "Sarah Mitchell", time: "28 Apr", title: "Bin collection reminder", body: "Please put your bins out Wednesday evening. Black bin this week.", unread: false, expires: "Expired" },
  ];
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
      {announcements.map(a => (
        <div key={a.id} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${a.unread ? C.primary : C.border}`, padding: "14px 16px", cursor: "pointer", position: "relative", opacity: a.expires === "Expired" ? 0.6 : 1 }}>
          {a.unread && <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: 4, background: C.primary }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>{a.from}</div>
              <div style={{ fontSize: 10, color: C.mutedFg }}>{a.time}</div>
            </div>
            <div style={{ padding: "2px 8px", borderRadius: 20, background: a.expires === "Expired" ? C.muted : "#ECFDF5" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: a.expires === "Expired" ? C.mutedFg : "#065F46" }}>{a.expires}</span>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: a.unread ? 700 : 600, color: C.fg, marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontSize: 12, color: C.mutedFg, lineHeight: 1.5 }}>{a.body}</div>
        </div>
      ))}
    </div>
  );
}

function UpdatesTab() {
  const [subTab, setSubTab] = useState<UpdatesSubTab>("duties");

  const subTabs: { key: UpdatesSubTab; label: string; badge?: number }[] = [
    { key: "duties", label: "Duties" },
    { key: "requests", label: "Requests", badge: 2 },
    { key: "announcements", label: "Announcements", badge: 1 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Sub-tab bar at top */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", flexShrink: 0 }}>
        <div style={{ background: C.muted, borderRadius: 12, padding: 3, display: "flex", gap: 2 }}>
          {subTabs.map(st => {
            const isActive = st.key === subTab;
            return (
              <button
                key={st.key}
                onClick={() => setSubTab(st.key)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", cursor: "pointer", boxShadow: isActive ? "0 1px 5px rgba(15,23,42,0.08)" : "none", position: "relative" }}
              >
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

      {/* Sub-tab content */}
      {subTab === "duties" && <DutiesSubTab />}
      {subTab === "requests" && <RequestsSubTab />}
      {subTab === "announcements" && <AnnouncementsSubTab />}
    </div>
  );
}

export function UnitScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("myroom");

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

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
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.mutedFg }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.fg, letterSpacing: -0.4 }}>Maple Grove</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Room 1B</div>
          </div>
          <div style={{ padding: "6px 10px", borderRadius: 20, background: "#FEF3C7" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>Rent Due</span>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeTab === "myroom" && <MyRoomTab />}
        {activeTab === "rent" && <RentTab />}
        {activeTab === "updates" && <UpdatesTab />}
        {activeTab === "docs" && <DocsTab />}
      </div>

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
                  <div style={{ position: "absolute", top: 3, right: 4, width: 14, height: 14, borderRadius: 7, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
