import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", success: "#10B981", warning: "#F59E0B",
  danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

type Priority = "low" | "normal" | "urgent";
type Step = "form" | "submitted";

const categories = [
  { key: "plumbing", icon: "🚿", label: "Plumbing" },
  { key: "electric", icon: "⚡", label: "Electrical" },
  { key: "heating", icon: "🔥", label: "Heating" },
  { key: "appliance", icon: "🧰", label: "Appliance" },
  { key: "locks", icon: "🔑", label: "Locks / Keys" },
  { key: "other", icon: "🔧", label: "Other" },
];

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: "Low — not urgent",    color: C.mutedFg, bg: C.muted },
  normal: { label: "Normal — this week",  color: "#92400E", bg: "#FEF3C7" },
  urgent: { label: "Urgent — ASAP",       color: "#991B1B", bg: "#FEE2E2" },
};

export function RequestDetailScreen() {
  const [step, setStep] = useState<Step>("form");
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (step === "submitted") {
    return (
      <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", textAlign: "center", gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5 }}>Request submitted!</div>
        <div style={{ fontSize: 13, color: C.mutedFg, lineHeight: 1.6 }}>Your landlord has been notified and will get back to you soon. You can track the status in the Requests tab.</div>
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px", width: "100%", textAlign: "left", marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Your Request</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.fg, marginBottom: 4 }}>{title || "Boiler not heating"}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: priorityConfig[priority].bg, color: priorityConfig[priority].color }}>{priority}</span>
            <span style={{ fontSize: 11, color: C.mutedFg }}>Room 1B · Just now</span>
          </div>
        </div>
        <button onClick={() => setStep("form")} style={{ width: "100%", padding: "14px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.fg }}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "12px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: C.mutedFg }}>←</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.fg }}>New Request</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Room 1B · Maple Grove</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Category */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 10 }}>Category</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {categories.map(cat => (
              <div key={cat.key} onClick={() => setCategory(cat.key)}
                style={{ background: C.card, borderRadius: 12, border: `2px solid ${category === cat.key ? C.primary : C.border}`, padding: "12px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: category === cat.key ? C.primary : C.fg }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 10 }}>Priority</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig[Priority]][]).map(([key, cfg]) => (
              <div key={key} onClick={() => setPriority(key)}
                style={{ background: C.card, borderRadius: 12, border: `2px solid ${priority === key ? C.primary : C.border}`, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: priority === key ? C.primary : C.border, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.fg, textTransform: "capitalize" }}>{key}</span>
                  <span style={{ fontSize: 12, color: C.mutedFg, marginLeft: 6 }}>— {cfg.label.split("—")[1]?.trim()}</span>
                </div>
                <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 20, background: cfg.bg }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: "capitalize" }}>{key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Boiler not heating" 
            style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail — when it started, how severe it is…" rows={4}
            style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box", resize: "none", lineHeight: 1.5 }} />
        </div>

        {/* Photo attach hint */}
        <div style={{ background: C.muted, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1.5px dashed ${C.border}` }}>
          <span style={{ fontSize: 24 }}>📷</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>Attach a photo</div>
            <div style={{ fontSize: 11, color: C.mutedFg }}>Helps the landlord understand the issue faster</div>
          </div>
        </div>

        <button onClick={() => setStep("submitted")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, cursor: "pointer", fontSize: 15, fontWeight: 800, color: "#fff" }}>
          Submit Request
        </button>

      </div>
    </div>
  );
}
