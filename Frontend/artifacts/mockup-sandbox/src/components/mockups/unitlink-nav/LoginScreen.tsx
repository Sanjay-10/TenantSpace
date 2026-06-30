import React, { useState } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", g1: "#1D4ED8", g3: "#3B82F6",
};

export function LoginScreen() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11, color: C.fg }}>●●●</span><span style={{ fontSize: 11, color: C.fg }}>🔋</span></div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hero card */}
        <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 24, padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 70, border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, border: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", right: 30, bottom: -20, width: 90, height: 90, borderRadius: 45, border: "1px solid rgba(255,255,255,0.07)" }} />

          <div style={{ width: 72, height: 72, borderRadius: 36, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            🏠
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.8, marginBottom: 6 }}>UnitLink</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Welcome back — sign in to your account.</div>
        </div>

        {/* Form card */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Email */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Email</div>
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              placeholder="you@example.com" type="email"
              style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${focused === "email" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "email" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Password</div>
            <div style={{ position: "relative" }}>
              <input
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                type={showPw ? "text" : "password"} placeholder="••••••••"
                style={{ width: "100%", boxSizing: "border-box", padding: "13px 44px 13px 14px", borderRadius: 12, border: `1.5px solid ${focused === "password" ? C.primary : C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: focused === "password" ? C.accent : C.bg, outline: "none", transition: "border-color 0.15s, background 0.15s" }}
              />
              <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.mutedFg }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: -6 }}>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 600, cursor: "pointer" }}>Forgot password?</span>
          </div>

          {/* CTA */}
          <button style={{ width: "100%", padding: "14px", borderRadius: 12, background: C.primary, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Sign In
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.mutedFg, fontWeight: 600, letterSpacing: 0.5 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 10 }}>
            {[{ icon: "🍎", label: "Apple" }, { icon: "G", label: "Google", g: true }].map(s => (
              <button key={s.label} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.fg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: s.g ? 14 : 17, fontWeight: s.g ? 900 : undefined, color: s.g ? "#EA4335" : undefined }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, color: C.mutedFg }}>Don't have an account? </span>
          <span style={{ fontSize: 13, color: C.primary, fontWeight: 700, cursor: "pointer" }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}
