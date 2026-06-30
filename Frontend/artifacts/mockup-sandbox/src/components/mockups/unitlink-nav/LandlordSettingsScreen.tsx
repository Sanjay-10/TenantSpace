import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

function Row({ icon, label, value, danger, last }: { icon: string; label: string; value?: string; danger?: boolean; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: last ? "none" : `1px solid ${C.border}`, gap: 12, cursor: "pointer" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: danger ? "#FEF2F2" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? C.danger : C.fg }}>{label}</div>
        {value && <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>{value}</div>}
      </div>
      {!danger && <span style={{ fontSize: 15, color: C.mutedFg }}>›</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.1, padding: "0 4px", marginBottom: 8 }}>{title}</div>
      <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange}
      style={{ width: 40, height: 24, borderRadius: 12, background: value ? C.primary : C.border, cursor: "pointer", position: "relative", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute", top: 3, left: value ? 19 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
    </div>
  );
}

export function LandlordSettingsScreen() {
  const [pushNotifs,    setPushNotifs]    = useState(true);
  const [chatNotifs,    setChatNotifs]    = useState(true);
  const [requestNotifs, setRequestNotifs] = useState(true);
  const [choreNotifs,   setChoreNotifs]   = useState(true);
  const [rentNotifs,    setRentNotifs]    = useState(true);

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11 }}>●●●</span><span style={{ fontSize: 11 }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "14px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5 }}>Settings</div>
      </div>

      <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>

        {/* Profile card */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>SB</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.fg }}>Sarah Blake</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>sarah.blake@email.com</div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>+44 7700 900456</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 20, background: C.primaryLight }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.primary }}>Landlord</span>
          </div>
        </div>

        {/* Account */}
        <Section title="Account">
          <Row icon="👤" label="Change Name"  value="Sarah Blake" />
          <Row icon="📧" label="Change Email" value="sarah.blake@email.com" />
          <Row icon="📱" label="Change Phone" value="+44 7700 900456" last />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {[
            { icon: "🔔", label: "Push Notifications",  sub: "All alerts and reminders",               val: pushNotifs,    set: setPushNotifs    },
            { icon: "💬", label: "Chat Notifications",  sub: "Messages from tenants & group chats",    val: chatNotifs,    set: setChatNotifs    },
            { icon: "📋", label: "New Requests",        sub: "When a tenant raises a maintenance job",  val: requestNotifs, set: setRequestNotifs },
            { icon: "🧹", label: "Chore Reminders",     sub: "When a chore is due or missed",          val: choreNotifs,   set: setChoreNotifs   },
            { icon: "💷", label: "Rent Alerts",         sub: "Late payments and upcoming due dates",   val: rentNotifs,    set: setRentNotifs    },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{item.label}</div>
                <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>{item.sub}</div>
              </div>
              <Toggle value={item.val} onChange={() => item.set(v => !v)} />
            </div>
          ))}
        </Section>

        {/* Switch to Tenant */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "11px 14px", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🔄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>Switch to Tenant</div>
              <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>View your own rented unit</div>
            </div>
            <span style={{ fontSize: 15, color: C.primary }}>›</span>
          </div>
        </div>

        {/* Sign out */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <Row icon="🚪" label="Sign Out" danger last />
        </div>

        {/* Delete account */}
        <div style={{ background: "#FEF2F2", borderRadius: 16, border: `1px solid #FECACA`, overflow: "hidden" }}>
          <Row icon="🗑️" label="Delete Account" danger last />
        </div>

        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <div style={{ fontSize: 11, color: C.mutedFg }}>UnitLink v1.0.0</div>
        </div>

      </div>

    </div>
  );
}
