import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", success: "#10B981", g1: "#1D4ED8", g3: "#3B82F6",
};

export function SignUpScreen() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const pwMatch    = confirm.length > 0 && password === confirm;
  const pwMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      {/* Top bar */}
      <div style={{ background: C.card, padding: "12px 20px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: C.muted, border: "none", cursor: "pointer", fontSize: 16, color: C.mutedFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.fg, letterSpacing: -0.3 }}>Create account</div>
          <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 1 }}>Step 1 of 2</div>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ width: 20, height: 6, borderRadius: 3, background: C.primary }} />
          <div style={{ width: 6, height: 6, borderRadius: 3, background: C.border }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hero card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 24, padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, border: "1px solid rgba(255,255,255,0.08)" }} />

          <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            ✨
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.4, marginBottom: 6 }}>Join UnitLink</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Create your free account and get started in seconds.</div>
        </div>

        {/* Form card */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Name */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Full Name</div>
            <input value={name} onChange={e => setName(e.target.value)}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              placeholder="Alex Turner" type="text"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${focused === "name" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "name" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
            />
          </div>

          {/* Email */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              placeholder="alex@example.com" type="email"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${focused === "email" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "email" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Password</div>
            <div style={{ position: "relative" }}>
              <input value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                style={{ width: "100%", boxSizing: "border-box", padding: "13px 44px 13px 14px", borderRadius: 12, border: `1.5px solid ${focused === "password" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "password" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
              />
              <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.mutedFg }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Confirm Password</div>
            <div style={{ position: "relative" }}>
              <input value={confirm} onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                type={showCf ? "text" : "password"} placeholder="Repeat your password"
                style={{ width: "100%", boxSizing: "border-box", padding: "13px 44px 13px 14px", borderRadius: 12, border: `1.5px solid ${pwMismatch ? "#EF4444" : pwMatch ? C.success : focused === "confirm" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "confirm" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
              />
              <button onClick={() => setShowCf(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.mutedFg }}>
                {showCf ? "🙈" : "👁"}
              </button>
            </div>
            {pwMismatch && <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 600, marginTop: 5 }}>Passwords don't match</div>}
            {pwMatch    && <div style={{ fontSize: 11, color: C.success,  fontWeight: 600, marginTop: 5 }}>✓ Passwords match</div>}
          </div>

          <button style={{ width: "100%", padding: "14px", borderRadius: 12, background: C.primary, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 2 }}>
            Continue →
          </button>

          <div style={{ fontSize: 11, color: C.mutedFg, textAlign: "center", lineHeight: 1.6 }}>
            By continuing you agree to our{" "}
            <span style={{ color: C.primary, fontWeight: 600, cursor: "pointer" }}>Terms</span> and{" "}
            <span style={{ color: C.primary, fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>.
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, color: C.mutedFg }}>Already have an account? </span>
          <span style={{ fontSize: 13, color: C.primary, fontWeight: 700, cursor: "pointer" }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
