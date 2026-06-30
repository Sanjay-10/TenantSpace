import React, { useState, useRef, useEffect } from "react";

const C = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  fg: "#0F172A",
  muted: "#F1F5F9",
  mutedFg: "#64748B",
  border: "#E2E8F0",
  primary: "#2563EB",
  accent: "#EFF6FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  g1: "#1D4ED8",
  g3: "#3B82F6",
};

type Detail = { id: number; label: string; value: string };

const DEFAULT_DETAILS: Detail[] = [
  { id: 1, label: "Lease End", value: "Dec 2025" },
  { id: 2, label: "Deposit", value: "£800 (held)" },
  { id: 3, label: "Wifi", value: "Included" },
  { id: 4, label: "Bills", value: "Included" },
];

function AddDetailRow({ onSave, onCancel }: { onSave: (label: string, value: string) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => { labelRef.current?.focus(); }, []);

  return (
    <div style={{ background: C.muted, borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, border: `1.5px dashed ${C.primary}` }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={labelRef}
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label  (e.g. Parking, Internet speed)"
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 12, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none" }}
        />
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && label.trim() && value.trim() && onSave(label.trim(), value.trim())}
          placeholder="Value"
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 12, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none" }}
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.mutedFg }}>
          Cancel
        </button>
        <button
          onClick={() => label.trim() && value.trim() && onSave(label.trim(), value.trim())}
          style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: C.primary, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function LandlordRoomScreen() {
  const [details, setDetails] = useState<Detail[]>(DEFAULT_DETAILS);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");

  function addDetail(label: string, value: string) {
    setDetails(prev => [...prev, { id: Date.now(), label, value }]);
    setAdding(false);
  }

  function deleteDetail(id: number) {
    setDetails(prev => prev.filter(d => d.id !== id));
  }

  function startEdit(d: Detail) {
    setEditingId(d.id);
    setEditLabel(d.label);
    setEditValue(d.value);
  }

  function saveEdit() {
    if (!editLabel.trim() || !editValue.trim()) return;
    setDetails(prev => prev.map(d => d.id === editingId ? { ...d, label: editLabel.trim(), value: editValue.trim() } : d));
    setEditingId(null);
  }

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
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: C.mutedFg }}>←</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.fg, letterSpacing: -0.4 }}>Room 1B</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Maple Grove</div>
          </div>
          <button
            onClick={() => { setEditing(e => !e); setAdding(false); setEditingId(null); }}
            style={{ padding: "7px 16px", borderRadius: 20, border: editing ? "none" : `1px solid ${C.border}`, background: editing ? C.primary : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, color: editing ? "#fff" : C.fg }}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Tenant info */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>JL</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>James Liu</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Tenant · Since Jan 2025</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 20, background: "#FEF3C7" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>Rent Pending</span>
          </div>
        </div>

        {/* Room details — editable */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, letterSpacing: 1, textTransform: "uppercase" }}>Room Details</div>
            <span style={{ fontSize: 11, color: C.mutedFg }}>Tenant sees these</span>
          </div>

          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {details.map((d, i) => (
              <div key={d.id}>
                {editingId === d.id ? (
                  <div style={{ padding: "10px 14px", display: "flex", gap: 8, background: C.accent }}>
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${C.primary}`, fontSize: 12, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none" }}
                    />
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveEdit()}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${C.primary}`, fontSize: 12, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none" }}
                    />
                    <button onClick={saveEdit} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: C.primary, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>✓</button>
                  </div>
                ) : (
                  <div
                    onClick={() => editing && startEdit(d)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 14px",
                      borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                      cursor: editing ? "pointer" : "default",
                      background: editing ? "transparent" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.mutedFg, flex: 1 }}>{d.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{d.value}</span>
                      {editing && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={e => { e.stopPropagation(); startEdit(d); }} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.muted, cursor: "pointer", fontSize: 13 }}>✏️</button>
                          <button onClick={e => { e.stopPropagation(); deleteDetail(d.id); }} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#FEE2E2", cursor: "pointer", fontSize: 13 }}>×</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add detail row */}
          <div style={{ marginTop: 10 }}>
            {adding ? (
              <AddDetailRow onSave={addDetail} onCancel={() => setAdding(false)} />
            ) : (
              <button
                onClick={() => { setAdding(true); setEditing(true); }}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.mutedFg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <span style={{ fontSize: 16 }}>＋</span> Add Detail
              </button>
            )}
          </div>
        </div>

        {/* Access info */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.fg, marginBottom: 10 }}>Access</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.mutedFg }}>Room Code</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.fg, letterSpacing: 2 }}>A4-8X2</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.mutedFg }}>Monthly Rent</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>£800</span>
          </div>
        </div>

        {/* Docs quick view */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "13px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.fg }}>Documents</div>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 600 }}>+ Upload</span>
          </div>
          {[{ name: "Tenancy Agreement", icon: "📄" }, { name: "Room Inventory", icon: "📋" }].map((d, i) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: i > 0 ? 8 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 18 }}>{d.icon}</span>
              <span style={{ fontSize: 13, color: C.fg, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 13, color: C.mutedFg }}>↓</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
