import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", danger: "#EF4444", g1: "#1D4ED8", g3: "#3B82F6",
};

type Step = "details" | "rooms" | "done";

export function AddPropertyScreen() {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [roomCount, setRoomCount] = useState(3);
  const [rent, setRent] = useState("");

  const propertyTypes = [
    { key: "hmo", label: "HMO / Shared House", icon: "🏠" },
    { key: "flat", label: "Flat / Apartment", icon: "🏢" },
    { key: "studio", label: "Studio", icon: "🛋️" },
    { key: "other", label: "Other", icon: "🏘️" },
  ];

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
          <button onClick={() => step === "details" ? null : setStep(step === "rooms" ? "details" : "rooms")} style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, border: "none", cursor: "pointer", fontSize: 16, color: C.mutedFg }}>×</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.fg }}>Add Property</div>
            <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>
              {step === "details" ? "Step 1 of 2 — Property details" : step === "rooms" ? "Step 2 of 2 — Rooms setup" : "All done!"}
            </div>
          </div>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5 }}>
            {["details", "rooms"].map((s, i) => (
              <div key={s} style={{ width: s === step ? 22 : 7, height: 7, borderRadius: 4, background: s === step ? C.primary : (["details","rooms","done"].indexOf(step) > i ? C.primary : C.border), transition: "all 0.2s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Step 1 — Details */}
        {step === "details" && (
          <>
            {/* Property type */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 10 }}>Property Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {propertyTypes.map(pt => (
                  <div key={pt.key} onClick={() => setType(pt.key)} style={{ background: C.card, borderRadius: 14, border: `2px solid ${type === pt.key ? C.primary : C.border}`, padding: "14px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{pt.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: type === pt.key ? C.primary : C.fg }}>{pt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Name & Address */}
            {[
              { label: "Property Name", value: name, set: setName, placeholder: "e.g. Maple Grove" },
              { label: "Address", value: address, set: setAddress, placeholder: "12 Maple Street, London" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            <button onClick={() => setStep("rooms")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, cursor: "pointer", fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 4 }}>
              Next — Set up Rooms
            </button>
          </>
        )}

        {/* Step 2 — Rooms */}
        {step === "rooms" && (
          <>
            <div style={{ background: C.primaryLight, borderRadius: 12, padding: "12px 14px", marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{name || "New Property"}</div>
              <div style={{ fontSize: 12, color: "#1D4ED8", marginTop: 2 }}>{address || "No address set"}</div>
            </div>

            {/* Room count */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 10 }}>Number of Rooms</label>
              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => setRoomCount(r => Math.max(1, r - 1))} style={{ width: 36, height: 36, borderRadius: 18, background: C.muted, border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, color: C.fg, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.fg }}>{roomCount}</div>
                  <div style={{ fontSize: 11, color: C.mutedFg }}>rooms</div>
                </div>
                <button onClick={() => setRoomCount(r => r + 1)} style={{ width: 36, height: 36, borderRadius: 18, background: C.primary, border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>

            {/* Default rent */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Default Monthly Rent (£)</label>
              <input value={rent} onChange={e => setRent(e.target.value)} placeholder="e.g. 800" type="number"
                style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 6 }}>You can set individual rent per room later.</div>
            </div>

            {/* Room preview */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 8 }}>Rooms Preview</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: Math.min(roomCount, 4) }).map((_, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>🚪</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>Room {i + 1}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: C.muted, color: C.mutedFg }}>Vacant</span>
                      {rent && <span style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>£{rent}/mo</span>}
                    </div>
                  </div>
                ))}
                {roomCount > 4 && <div style={{ fontSize: 11, color: C.mutedFg, textAlign: "center", padding: "4px 0" }}>+{roomCount - 4} more rooms</div>}
              </div>
            </div>

            <button onClick={() => setStep("done")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, cursor: "pointer", fontSize: 15, fontWeight: 800, color: "#fff" }}>
              Create Property
            </button>
          </>
        )}

        {/* Done */}
        {step === "done" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.fg, letterSpacing: -0.5 }}>{name || "Property"} created!</div>
            <div style={{ fontSize: 13, color: C.mutedFg, lineHeight: 1.6 }}>{roomCount} rooms are ready. Share the room codes with your tenants to get started.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 8 }}>
              <button style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#fff" }}>View Property</button>
              <button style={{ width: "100%", padding: "15px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.fg }}>Share Room Codes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
