import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

export function TenantProfileScreen() {
  const [name, setName] = useState("Alex Thompson");
  const [email, setEmail] = useState("alex.thompson@email.com");
  const [phone, setPhone] = useState("+44 7700 900123");
  const [bio, setBio] = useState("Quiet professional, clean & tidy.");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "12px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.mutedFg, cursor: "pointer" }}>←</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.fg, flex: 1 }}>Edit Profile</div>
        <button
          onClick={handleSave}
          style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: saved ? "#ECFDF5" : C.primary, cursor: "pointer", fontSize: 13, fontWeight: 700, color: saved ? "#065F46" : "#fff", transition: "all 0.2s" }}
        >
          {saved ? "✓ Saved" : "Save"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 88, height: 88, borderRadius: 44, background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>AT</span>
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, background: C.primary, border: "2.5px solid #F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13 }}>📷</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, cursor: "pointer" }}>Change photo</div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Full Name", value: name, set: setName, placeholder: "Your full name", type: "text" },
            { label: "Email", value: email, set: setEmail, placeholder: "you@example.com", type: "email" },
            { label: "Phone", value: phone, set: setPhone, placeholder: "+44 7700 000000", type: "tel" },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                type={f.type}
                style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          {/* Bio */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 6 }}>Bio <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</span></label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell your landlord a little about yourself…"
              rows={3}
              style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box", resize: "none", lineHeight: 1.5 }}
            />
            <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 4, textAlign: "right" }}>{bio.length} / 160</div>
          </div>
        </div>

        {/* Emergency contact */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Emergency Contact</div>
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.fg }}>Add emergency contact</div>
              <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>Name, relationship & phone number</div>
            </div>
            <span style={{ fontSize: 16, color: C.mutedFg }}>›</span>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background: "#FEF2F2", borderRadius: 16, border: `1px solid #FECACA`, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 10 }}>Danger Zone</div>
          <div style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 12, lineHeight: 1.5 }}>Deleting your account is permanent and cannot be undone. All your data will be removed.</div>
          <button style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${C.danger}`, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.danger }}>
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}
