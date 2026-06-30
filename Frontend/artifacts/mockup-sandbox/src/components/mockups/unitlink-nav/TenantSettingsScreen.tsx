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

export function TenantSettingsScreen() {
  const [notifs, setNotifs] = useState(true);
  const [chatNotifs, setChatNotifs] = useState(true);
  const [requestNotifs, setRequestNotifs] = useState(true);
  const [activeTab, setActiveTab] = useState<"homes" | "requests" | "settings">("settings");

  return (
    <div style={{ width: 390, minHeight: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "14px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5 }}>Settings</div>
      </div>

      <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Profile — display only, not clickable */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>AT</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.fg }}>Alex Thompson</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>alex.thompson@email.com</div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>+44 7700 900123</div>
          </div>
        </div>

        {/* Account — edit the 3 fields */}
        <Section title="Account">
          <Row icon="👤" label="Change Name" value="Alex Thompson" />
          <Row icon="📧" label="Change Email" value="alex.thompson@email.com" />
          <Row icon="📱" label="Change Phone" value="+44 7700 900123" last />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {[
            { icon: "🔔", label: "Push Notifications", sub: "Messages, rent reminders & updates", val: notifs, set: setNotifs },
            { icon: "💬", label: "Chat Notifications", sub: "New messages from landlord & group", val: chatNotifs, set: setChatNotifs },
            { icon: "📋", label: "Request Updates", sub: "Status changes on your requests", val: requestNotifs, set: setRequestNotifs },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{item.label}</div>
                <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>{item.sub}</div>
              </div>
              <div onClick={() => item.set(n => !n)}
                style={{ width: 40, height: 24, borderRadius: 12, background: item.val ? C.primary : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute", top: 3, left: item.val ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
              </div>
            </div>
          ))}
        </Section>

        {/* Sign out */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <Row icon="🚪" label="Sign Out" danger last />
        </div>

        {/* Switch to Landlord */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "11px 14px", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🏠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>Switch to Landlord</div>
              <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>Manage your own properties</div>
            </div>
            <span style={{ fontSize: 15, color: C.primary }}>›</span>
          </div>
        </div>

        {/* Delete account */}
        <div style={{ background: "#FEF2F2", borderRadius: 16, border: `1px solid #FECACA`, overflow: "hidden" }}>
          <Row icon="🗑️" label="Delete Account" danger last />
        </div>

        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          <div style={{ fontSize: 11, color: C.mutedFg }}>UnitLink v1.0.0</div>
        </div>

      </div>


    </div>
  );
}
