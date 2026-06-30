import React, { useState, useRef } from "react";

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  accent: "#EFF6FF", g1: "#1D4ED8", g3: "#3B82F6",
};

const PRESETS = ["Kitchen", "Bathroom", "Hallway", "Bins", "Living room", "Garden"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Freq = "Weekly" | "Bi-weekly" | "Monthly";

type Person = { id: string; name: string; initials: string; color: string; room: string };

const ALL_PEOPLE: Person[] = [
  { id: "jess",  name: "Jess",  initials: "JD", color: "#2563EB", room: "Room 1" },
  { id: "marc",  name: "Marc",  initials: "MO", color: "#8B5CF6", room: "Room 1" },
  { id: "james", name: "James", initials: "JL", color: "#F97316", room: "Room 2" },
  { id: "priya", name: "Priya", initials: "PS", color: "#10B981", room: "Room 3" },
  { id: "tom",   name: "Tom",   initials: "TR", color: "#EF4444", room: "Room 3" },
  { id: "owen",  name: "Owen",  initials: "OT", color: "#64748B", room: "Basement" },
];

function Avatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function AssignDutyScreen() {
  const [dutyName, setDutyName]         = useState("Kitchen");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon"]);
  const [freq, setFreq]                 = useState<Freq>("Weekly");
  const [reminder, setReminder]         = useState(true);
  const [repeatCycle, setRepeatCycle]   = useState(true);
  const [rotation, setRotation]         = useState<Person[]>([...ALL_PEOPLE]);
  const [showAdd, setShowAdd]           = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const removed = ALL_PEOPLE.filter(p => !rotation.find(r => r.id === p.id));

  function toggleDay(d: string) {
    setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  }
  function moveUp(i: number) {
    if (i === 0) return;
    const n = [...rotation]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setRotation(n);
  }
  function moveDown(i: number) {
    if (i === rotation.length - 1) return;
    const n = [...rotation]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setRotation(n);
  }
  function removePerson(id: string) {
    setRotation(p => p.filter(x => x.id !== id));
  }
  function addPerson(person: Person) {
    setRotation(p => [...p, person]);
    setShowAdd(false);
  }

  // Drag handlers
  function onDragStart(i: number) { dragIndex.current = i; }
  function onDragEnter(i: number) { setDragOver(i); }
  function onDragEnd() {
    if (dragIndex.current !== null && dragOver !== null && dragIndex.current !== dragOver) {
      const n = [...rotation];
      const [moved] = n.splice(dragIndex.current, 1);
      n.splice(dragOver, 0, moved);
      setRotation(n);
    }
    dragIndex.current = null;
    setDragOver(null);
  }

  const weekPreview = rotation;

  return (
    <div style={{ width: 390, height: 844, background: C.bg, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ height: 44, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}><span style={{ fontSize: 11 }}>●●●</span><span style={{ fontSize: 11 }}>🔋</span></div>
      </div>

      {/* Header */}
      <div style={{ background: C.card, padding: "12px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.mutedFg, cursor: "pointer" }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.fg, letterSpacing: -0.4 }}>Assign Chore</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 1 }}>Maple Grove</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 24px", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "none" } as React.CSSProperties}>

        {/* Duty Name */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Chore Name</div>
          <input value={dutyName} onChange={e => setDutyName(e.target.value)} placeholder="e.g. Kitchen, Bins…"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", color: C.fg, background: C.card, outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setDutyName(p)}
                style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${dutyName === p ? C.primary : C.border}`, background: dutyName === p ? C.primary : C.card, color: dutyName === p ? "#fff" : C.mutedFg, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Days */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Day(s)</div>
          <div style={{ display: "flex", gap: 5 }}>
            {DAYS.map(d => {
              const on = selectedDays.includes(d);
              return (
                <button key={d} onClick={() => toggleDay(d)}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${on ? C.primary : C.border}`, background: on ? C.primary : C.card, color: on ? "#fff" : C.mutedFg, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Repeats</div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["Weekly", "Bi-weekly", "Monthly"] as Freq[]).map(f => (
              <button key={f} onClick={() => setFreq(f)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: `1.5px solid ${freq === f ? C.primary : C.border}`, background: freq === f ? C.primary : C.card, color: freq === f ? "#fff" : C.mutedFg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Rotation builder */}
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedFg, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Rotation Order</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginBottom: 10 }}>Drag ≡ to reorder · × to remove</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rotation.map((person, i) => {
                const isDraggingOver = dragOver === i;
                return (
                  <div
                    key={person.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragOver={e => e.preventDefault()}
                    onDragEnd={onDragEnd}
                    style={{
                      background: C.card,
                      borderRadius: 12,
                      border: `1.5px solid ${isDraggingOver ? C.primary : C.border}`,
                      padding: "11px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: dragIndex.current === i ? 0.4 : 1,
                      boxShadow: isDraggingOver ? `0 0 0 3px ${C.accent}` : "none",
                      transition: "box-shadow 0.15s, border-color 0.15s",
                    }}
                  >
                    {/* Drag handle */}
                    <div style={{ cursor: "grab", color: C.border, fontSize: 14, lineHeight: 1, letterSpacing: 1, userSelect: "none", flexShrink: 0, padding: "0 2px" }}>
                      ⠿
                    </div>

                    {/* Position badge */}
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: i === 0 ? C.primary : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? "#fff" : C.mutedFg, flexShrink: 0 }}>{i + 1}</div>

                    <Avatar initials={person.initials} color={person.color} size={30} />

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{person.name}</div>
                      <div style={{ fontSize: 11, color: C.mutedFg }}>{person.room}</div>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removePerson(person.id)}
                      style={{ width: 26, height: 26, borderRadius: 13, border: "none", background: "#FEE2E2", color: "#EF4444", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                  </div>
                );
              })}

              {/* Add person */}
              <button onClick={() => setShowAdd(v => !v)}
                style={{ padding: "11px 14px", borderRadius: 12, border: `1.5px dashed ${showAdd ? C.primary : C.border}`, background: showAdd ? C.accent : "transparent", color: showAdd ? C.primary : C.mutedFg, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add person to rotation
              </button>

              {showAdd && removed.length > 0 && (
                <div style={{ background: C.card, borderRadius: 12, border: `1.5px solid ${C.primary}`, padding: "10px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {removed.map(person => (
                    <button key={person.id} onClick={() => addPerson(person)}
                      style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.muted, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <Avatar initials={person.initials} color={person.color} size={26} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>{person.name}</div>
                        <div style={{ fontSize: 11, color: C.mutedFg }}>{person.room}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Add</span>
                    </button>
                  ))}
                </div>
              )}
              {showAdd && removed.length === 0 && (
                <div style={{ padding: "10px 14px", borderRadius: 12, background: C.muted, fontSize: 12, color: C.mutedFg, textAlign: "center" }}>All tenants are already in the rotation</div>
              )}
            </div>
        </div>

        {/* Repeat cycle */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>Repeat cycle</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>Once everyone has had a turn, start again from the top</div>
          </div>
          <div onClick={() => setRepeatCycle(v => !v)}
            style={{ width: 44, height: 26, borderRadius: 13, background: repeatCycle ? C.primary : C.border, cursor: "pointer", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: repeatCycle ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
          </div>
        </div>

        {/* Reminder */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>Send reminder</div>
            <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>Notify tenant the day before</div>
          </div>
          <div onClick={() => setReminder(v => !v)}
            style={{ width: 44, height: 26, borderRadius: 13, background: reminder ? C.primary : C.border, cursor: "pointer", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: reminder ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
          </div>
        </div>

        {/* Preview */}
        {dutyName && selectedDays.length > 0 && rotation.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g3})`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
              Rotation Preview
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {weekPreview.map((person, w) => (
                <div key={w} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", width: 52, flexShrink: 0 }}>Week {w + 1}</div>
                  <Avatar initials={person.initials} color="rgba(255,255,255,0.25)" size={22} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{person.name} <span style={{ opacity: 0.65, fontWeight: 500, fontSize: 11 }}>· {person.room}</span></div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 7, marginTop: 2 }}>
                {repeatCycle ? "…then repeats from Week 1" : "…ends after one full cycle"} · {freq} on {selectedDays.join(", ")}{reminder ? " · Reminder on" : ""}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Save */}
      <div style={{ padding: "12px 16px 28px", background: C.card, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button style={{ width: "100%", padding: "15px", borderRadius: 14, background: C.primary, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
          Save Chore
        </button>
      </div>

    </div>
  );
}
