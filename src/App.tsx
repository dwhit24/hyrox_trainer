/// <reference types="vite/client" />
import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EXERCISE_TYPES = [
  { id: "run", name: "Run", icon: "🏃", defaultUnit: "m", color: "#3b9eff" },
  { id: "skierg", name: "SkiErg", icon: "⛷️", defaultUnit: "m", color: "#ff3c00" },
  { id: "sled_push", name: "Sled Push", icon: "🛷", defaultUnit: "m", color: "#ff3c00" },
  { id: "sled_pull", name: "Sled Pull", icon: "🔗", defaultUnit: "m", color: "#ff3c00" },
  { id: "burpee_jump", name: "Burpee Broad Jump", icon: "💥", defaultUnit: "m", color: "#ff3c00" },
  { id: "rowing", name: "Rowing", icon: "🚣", defaultUnit: "m", color: "#ff3c00" },
  { id: "farmers_carry", name: "Farmers Carry", icon: "💪", defaultUnit: "m", color: "#ff3c00" },
  { id: "sandbag_lunges", name: "Sandbag Lunges", icon: "🎒", defaultUnit: "m", color: "#ff3c00" },
  { id: "wall_balls", name: "Wall Balls", icon: "🏀", defaultUnit: "reps", color: "#ff3c00" },
];

const UNIT_OPTIONS = ["m", "km", "reps", "min"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(seconds: number | undefined | null) {
  if (!seconds && seconds !== 0) return "--:--";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function parseTimeInput(val: string) {
  if (!val) return 0;
  const parts = val.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + (parts[1] || 0);
  return parseInt(val) || 0;
}

function totalSeconds(blocks: any[]) {
  return blocks.reduce((sum, b) => sum + (b.time || 0), 0);
}

const emptyBlock = () => ({
  id: Date.now() + Math.random(),
  exerciseId: "run",
  distance: "",
  unit: "m",
  timeInput: "",
  time: 0,
  notes: "",
});

// ---------------------------------------------------------------------------
// Shared CSS
// ---------------------------------------------------------------------------
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #ff3c00; }
  .tab-btn { background: none; border: none; color: #666; cursor: pointer; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 2px; padding: 12px 18px; transition: all 0.2s; border-bottom: 2px solid transparent; white-space: nowrap; }
  .tab-btn.active { color: #ff3c00; border-bottom: 2px solid #ff3c00; }
  .tab-btn:hover { color: #f0f0f0; }
  .input-field { background: #161616; border: 1px solid #252525; color: #f0f0f0; padding: 9px 13px; border-radius: 5px; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; width: 100%; transition: border 0.2s; outline: none; }
  .input-field:focus { border-color: #ff3c00; background: #1a1a1a; }
  .select-field { background: #161616; border: 1px solid #252525; color: #f0f0f0; padding: 9px 13px; border-radius: 5px; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; width: 100%; outline: none; cursor: pointer; }
  .select-field:focus { border-color: #ff3c00; }
  .btn-primary { background: #ff3c00; color: #fff; border: none; padding: 11px 24px; font-family: 'Bebas Neue', sans-serif; font-size: 1.05rem; letter-spacing: 2px; cursor: pointer; border-radius: 5px; transition: all 0.2s; }
  .btn-primary:hover { background: #e03500; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; border: 1px solid #252525; color: #888; padding: 8px 16px; font-family: 'Bebas Neue', sans-serif; font-size: 0.95rem; letter-spacing: 1px; cursor: pointer; border-radius: 5px; transition: all 0.2s; }
  .btn-ghost:hover { border-color: #ff3c00; color: #ff3c00; }
  .card { background: #111; border: 1px solid #1c1c1c; border-radius: 8px; padding: 20px; }
  .block-card { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 8px; padding: 16px; margin-bottom: 10px; transition: border-color 0.2s; }
  .block-card:hover { border-color: #2a2a2a; }
  .block-number { width: 28px; height: 28px; background: #1e1e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans'; font-size: 0.78rem; color: #888; flex-shrink: 0; }
  .ex-pill { background: #161616; border: 1px solid #222; border-radius: 20px; padding: 8px 14px; cursor: pointer; font-family: 'DM Sans'; font-size: 0.85rem; transition: all 0.15s; display: flex; align-items: center; gap: 6px; color: #ccc; }
  .ex-pill:hover { border-color: #ff3c00; color: #ff3c00; }
  .icon-btn { background: none; border: none; cursor: pointer; color: #444; font-size: 0.9rem; padding: 4px 6px; border-radius: 3px; transition: all 0.15s; }
  .icon-btn:hover { color: #888; background: #1a1a1a; }
  .icon-btn.danger:hover { color: #ff4444; }
  .ai-bubble { padding: 13px 16px; border-radius: 8px; max-width: 88%; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; line-height: 1.65; }
  .ai-bubble.user { background: #1a0d00; border: 1px solid #ff3c0030; margin-left: auto; }
  .ai-bubble.assistant { background: #141414; border: 1px solid #222; }
  .stat-big { font-size: 2.4rem; color: #ff3c00; line-height: 1; }
  .progress-bar { height: 5px; background: #1a1a1a; border-radius: 3px; overflow: hidden; margin-top: 5px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #ff3c00, #ffaa00); border-radius: 3px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.25s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  .slide-in { animation: slideIn 0.2s ease; }
`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HyroxApp() {
  // Workout state
  const [tab, setTab] = useState("dashboard");
  const [workoutLog, setWorkoutLog] = useState<any[]>([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [workoutName, setWorkoutName] = useState("");
  const [blocks, setBlocks] = useState<any[]>([emptyBlock()]);
  const [addingExercise, setAddingExercise] = useState(false);
  const [viewingWorkout, setViewingWorkout] = useState<any>(null);

  // AI Coach state
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "Hey athlete 👋 I'm your Hyrox AI coach. Ask me anything — race strategy, training plans, station tips, or review your progress." },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Auth effect — runs once on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadWorkouts();
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadWorkouts();
      } else {
        setWorkoutLog([]);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll AI chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // ---------------------------------------------------------------------------
  // Data functions
  // ---------------------------------------------------------------------------
  async function loadWorkouts() {
    setDataLoading(true);
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `id, date, name, total_time,
         workout_blocks (
           id, exercise_id, distance, unit, time, time_input, notes, block_order
         )`
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWorkoutLog(
        data.map((w: any) => ({
          id: w.id,
          date: w.date,
          name: w.name,
          totalTime: w.total_time,
          blocks: [...(w.workout_blocks || [])]
            .sort((a: any, b: any) => a.block_order - b.block_order)
            .map((b: any) => ({
              id: b.id,
              exerciseId: b.exercise_id,
              distance: b.distance || "",
              unit: b.unit,
              time: b.time,
              timeInput: b.time_input || "",
              notes: b.notes || "",
              order: b.block_order,
            })),
        }))
      );
    }
    setDataLoading(false);
    setAuthLoading(false);
  }

  async function saveWorkout() {
    const validBlocks = blocks.filter((b) => b.distance || b.time);
    if (!validBlocks.length || !user) return;

    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        date: logDate,
        name: workoutName || `Workout — ${logDate}`,
        total_time: totalSeconds(validBlocks),
      })
      .select()
      .single();

    if (workoutError || !workout) {
      console.error("Error saving workout:", workoutError);
      return;
    }

    const blockInserts = validBlocks.map((b, i) => ({
      workout_id: workout.id,
      exercise_id: b.exerciseId,
      distance: b.distance,
      unit: b.unit,
      time: b.time,
      time_input: b.timeInput,
      notes: b.notes,
      block_order: i + 1,
    }));

    await supabase.from("workout_blocks").insert(blockInserts);
    await loadWorkouts();
    setBlocks([emptyBlock()]);
    setWorkoutName("");
    setTab("dashboard");
  }

  // ---------------------------------------------------------------------------
  // Auth functions
  // ---------------------------------------------------------------------------
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthError("✓ Account created! Check your email to confirm, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
    }
    setAuthSubmitting(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // ---------------------------------------------------------------------------
  // Workout block helpers (unchanged from original)
  // ---------------------------------------------------------------------------
  function updateBlock(id: number, field: string, value: any) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, [field]: value };
        if (field === "exerciseId") {
          const ex = EXERCISE_TYPES.find((e) => e.id === value);
          updated.unit = ex?.defaultUnit || "m";
        }
        if (field === "timeInput") updated.time = parseTimeInput(value);
        return updated;
      })
    );
  }

  function addBlock(exerciseId: string) {
    const ex = EXERCISE_TYPES.find((e) => e.id === exerciseId);
    setBlocks((prev) => [
      ...prev,
      { ...emptyBlock(), exerciseId, unit: ex?.defaultUnit || "m", id: Date.now() + Math.random() },
    ]);
    setAddingExercise(false);
  }

  function removeBlock(id: number) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: number, dir: "up" | "down") {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // AI Coach (unchanged from original)
  // ---------------------------------------------------------------------------
  async function sendAiMessage() {
    if (!aiInput.trim()) return;
    const userMsg = { role: "user", content: aiInput };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    setAiInput("");
    setAiLoading(true);

    const logSummary = workoutLog.length
      ? `Athlete has logged ${workoutLog.length} workouts. Recent: ${workoutLog
          .slice(0, 2)
          .map((w) => `${w.date} - ${w.name} (${w.blocks.length} blocks, total ${formatTime(w.totalTime)})`)
          .join("; ")}`
      : "No workouts logged yet.";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an elite Hyrox coach. Hyrox = 8x 1km runs each followed by: SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad Jump 80m, Rowing 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls 100 reps. Be specific, motivating, data-driven. Athlete context: ${logSummary}`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content?.[0]?.text || "Sorry, try again." },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    }
    setAiLoading(false);
  }

  const getEx = (id: string) => EXERCISE_TYPES.find((e) => e.id === id) || EXERCISE_TYPES[0];

  // Compute PRs from workout log
  const prs: Record<string, any> = {};
  EXERCISE_TYPES.forEach((ex) => {
    const efforts = workoutLog.flatMap((w) =>
      w.blocks
        .filter((b: any) => b.exerciseId === ex.id && b.time && b.distance)
        .map((b: any) => ({ time: b.time, distance: parseFloat(b.distance) }))
    );
    if (efforts.length) {
      prs[ex.id] = efforts.reduce((best: any, e: any) => (e.time < best.time ? e : best));
    }
  });

  // ---------------------------------------------------------------------------
  // Loading screen
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          background: "#0a0a0a",
          minHeight: "100vh",
          color: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", letterSpacing: 5, marginBottom: 12 }}>
            HYROX <span style={{ color: "#ff3c00" }}>TRAINER</span>
          </div>
          <div style={{ fontFamily: "'DM Sans'", color: "#444", fontSize: "0.85rem" }}>Loading...</div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Auth screen
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          background: "#0a0a0a",
          minHeight: "100vh",
          color: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .input-field { background: #161616; border: 1px solid #252525; color: #f0f0f0; padding: 11px 14px; border-radius: 5px; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; width: 100%; transition: border 0.2s; outline: none; }
          .input-field:focus { border-color: #ff3c00; background: #1a1a1a; }
          .btn-primary { background: #ff3c00; color: #fff; border: none; padding: 13px 24px; font-family: 'Bebas Neue', sans-serif; font-size: 1.05rem; letter-spacing: 2px; cursor: pointer; border-radius: 5px; transition: all 0.2s; width: 100%; }
          .btn-primary:hover { background: #e03500; }
          .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: "2.8rem", letterSpacing: 6 }}>HYROX</div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#ff3c00",
                fontFamily: "'DM Sans'",
                fontWeight: 700,
                letterSpacing: 3,
              }}
            >
              TRAINER
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 10, padding: 32 }}>
            <div style={{ fontSize: "1.5rem", letterSpacing: 3, marginBottom: 6 }}>
              {authMode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#555", marginBottom: 24 }}>
              {authMode === "login" ? "Welcome back, athlete." : "Join and start tracking your Hyrox journey."}
            </div>

            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    color: "#555",
                    letterSpacing: 2,
                    fontFamily: "'DM Sans'",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  EMAIL
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: "0.65rem",
                    color: "#555",
                    letterSpacing: 2,
                    fontFamily: "'DM Sans'",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  PASSWORD
                </label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {authError && (
                <div
                  style={{
                    fontFamily: "'DM Sans'",
                    fontSize: "0.82rem",
                    color: authError.startsWith("✓") ? "#22c55e" : "#ff4444",
                    marginBottom: 16,
                    padding: "10px 12px",
                    background: authError.startsWith("✓") ? "#0a1f0a" : "#1a0000",
                    borderRadius: 5,
                    border: `1px solid ${authError.startsWith("✓") ? "#166534" : "#330000"}`,
                  }}
                >
                  {authError}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={authSubmitting}>
                {authSubmitting ? "..." : authMode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                fontFamily: "'DM Sans'",
                fontSize: "0.82rem",
                color: "#555",
              }}
            >
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff3c00",
                  cursor: "pointer",
                  fontFamily: "'DM Sans'",
                  fontSize: "0.82rem",
                }}
              >
                {authMode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main app
  // ---------------------------------------------------------------------------
  return (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#f0f0f0" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Header ── */}
      <div
        style={{
          background: "#0c0c0c",
          borderBottom: "1px solid #1a1a1a",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: "1.9rem", letterSpacing: 5, color: "#fff" }}>HYROX</span>
              <span style={{ fontSize: "0.8rem", color: "#ff3c00", fontFamily: "'DM Sans'", fontWeight: 700, letterSpacing: 2 }}>
                TRAINER
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#444" }}>{user.email}</span>
              <button
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                onClick={handleLogout}
              >
                LOG OUT
              </button>
              <button
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                onClick={() => setTab("log")}
              >
                + LOG WORKOUT
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 6, overflowX: "auto" }}>
            {[
              ["dashboard", "Dashboard"],
              ["log", "Log Workout"],
              ["history", "History"],
              ["prs", "Station PRs"],
              ["coach", "AI Coach"],
            ].map(([t, label]) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? "active" : ""}`}
                onClick={() => {
                  setTab(t);
                  if (t !== "history") setViewingWorkout(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {/* ──────────── DASHBOARD ──────────── */}
        {tab === "dashboard" && (
          <div className="fade-up">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>
                YOUR PERFORMANCE
              </div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>OVERVIEW</div>
            </div>

            {dataLoading ? (
              <div style={{ color: "#333", fontFamily: "'DM Sans'", textAlign: "center", padding: "60px 0" }}>
                Loading your workouts...
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                  {[
                    { label: "Sessions", value: workoutLog.length },
                    { label: "Total Blocks", value: workoutLog.reduce((s, w) => s + w.blocks.length, 0) },
                    {
                      label: "Total Time",
                      value: workoutLog.length
                        ? formatTime(workoutLog.reduce((s, w) => s + w.totalTime, 0))
                        : "--",
                    },
                  ].map((s) => (
                    <div key={s.label} className="card">
                      <div className="stat-big">{s.value}</div>
                      <div style={{ fontSize: "0.68rem", color: "#555", fontFamily: "'DM Sans'", letterSpacing: 2, marginTop: 5 }}>
                        {s.label.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div style={{ fontSize: "1.1rem", letterSpacing: 3, color: "#666", marginBottom: 14 }}>
                    RECENT SESSIONS
                  </div>
                  {workoutLog.length === 0 ? (
                    <div style={{ color: "#333", fontFamily: "'DM Sans'", fontSize: "0.9rem", textAlign: "center", padding: "28px 0" }}>
                      No workouts yet. Hit <span style={{ color: "#ff3c00" }}>+ LOG WORKOUT</span> to start! 💪
                    </div>
                  ) : (
                    workoutLog.slice(0, 4).map((w) => (
                      <div
                        key={w.id}
                        onClick={() => { setViewingWorkout(w); setTab("history"); }}
                        style={{ padding: "12px 0", borderBottom: "1px solid #161616", cursor: "pointer", transition: "opacity 0.2s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontFamily: "'DM Sans'", fontSize: "0.92rem", fontWeight: 500 }}>{w.name}</span>
                            <span style={{ fontFamily: "'DM Sans'", fontSize: "0.75rem", color: "#555", marginLeft: 10 }}>
                              {w.date}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 12, fontFamily: "'DM Sans'", fontSize: "0.8rem", color: "#888" }}>
                            <span>{w.blocks.length} blocks</span>
                            <span style={{ color: "#ff7b00" }}>{formatTime(w.totalTime)}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                          {w.blocks.map((b: any, i: number) => {
                            const ex = getEx(b.exerciseId);
                            return (
                              <span
                                key={i}
                                style={{ fontSize: "0.75rem", fontFamily: "'DM Sans'", background: "#161616", border: "1px solid #1e1e1e", padding: "2px 7px", borderRadius: 3, color: "#777" }}
                              >
                                {ex.icon} {b.distance}{b.unit}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ──────────── LOG WORKOUT ──────────── */}
        {tab === "log" && (
          <div className="fade-up">
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>
                BUILD YOUR SESSION
              </div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>LOG WORKOUT</div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'", display: "block", marginBottom: 5 }}>
                    DATE
                  </label>
                  <input className="input-field" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'", display: "block", marginBottom: 5 }}>
                    WORKOUT NAME (optional)
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Saturday Hyrox Sim"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 12 }}>
                WORKOUT BLOCKS — IN ORDER
              </div>
              {blocks.map((block, idx) => {
                const ex = getEx(block.exerciseId);
                const isRun = block.exerciseId === "run";
                return (
                  <div key={block.id} className="block-card slide-in">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div className="block-number">{idx + 1}</div>
                      <div style={{ width: 6, height: 6, background: isRun ? "#3b9eff" : "#ff3c00", borderRadius: "50%", flexShrink: 0 }} />
                      <select className="select-field" style={{ flex: 1 }} value={block.exerciseId} onChange={(e) => updateBlock(block.id, "exerciseId", e.target.value)}>
                        {EXERCISE_TYPES.map((e) => (
                          <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
                        ))}
                      </select>
                      <button className="icon-btn" onClick={() => moveBlock(block.id, "up")}>↑</button>
                      <button className="icon-btn" onClick={() => moveBlock(block.id, "down")}>↓</button>
                      <button className="icon-btn danger" onClick={() => removeBlock(block.id)}>✕</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 1, fontFamily: "'DM Sans'", display: "block", marginBottom: 4 }}>
                          DISTANCE / REPS
                        </label>
                        <input
                          className="input-field"
                          placeholder={block.unit === "reps" ? "e.g. 50" : "e.g. 500"}
                          value={block.distance}
                          onChange={(e) => updateBlock(block.id, "distance", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 1, fontFamily: "'DM Sans'", display: "block", marginBottom: 4 }}>
                          UNIT
                        </label>
                        <select className="select-field" value={block.unit} onChange={(e) => updateBlock(block.id, "unit", e.target.value)}>
                          {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 1, fontFamily: "'DM Sans'", display: "block", marginBottom: 4 }}>
                          TIME (mm:ss)
                        </label>
                        <input
                          className="input-field"
                          placeholder="e.g. 4:30"
                          value={block.timeInput}
                          onChange={(e) => updateBlock(block.id, "timeInput", e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <input
                        className="input-field"
                        placeholder="Notes — e.g. felt strong, 20kg sled, HR 165..."
                        value={block.notes}
                        onChange={(e) => updateBlock(block.id, "notes", e.target.value)}
                        style={{ fontSize: "0.82rem", color: "#888" }}
                      />
                    </div>
                    {(block.distance || block.time > 0) && (
                      <div style={{ marginTop: 10, padding: "7px 11px", background: "#141414", borderRadius: 5, fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#777", display: "flex", gap: 18, flexWrap: "wrap" }}>
                        {block.distance && <span>{ex.icon} <strong style={{ color: "#ccc" }}>{block.distance}{block.unit}</strong></span>}
                        {block.time > 0 && <span>⏱ <strong style={{ color: "#ff7b00" }}>{formatTime(block.time)}</strong></span>}
                        {block.distance && block.time > 0 && block.unit === "m" && parseFloat(block.distance) > 0 && (
                          <span>📈 <strong style={{ color: "#aaa" }}>{Math.round((block.time / parseFloat(block.distance)) * 1000)}s / km</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!addingExercise ? (
              <button className="btn-ghost" onClick={() => setAddingExercise(true)} style={{ width: "100%", marginBottom: 16, padding: "13px", fontSize: "0.95rem" }}>
                + ADD BLOCK
              </button>
            ) : (
              <div className="card slide-in" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 12 }}>
                  SELECT EXERCISE
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {EXERCISE_TYPES.map((ex) => (
                    <button key={ex.id} className="ex-pill" onClick={() => addBlock(ex.id)}>
                      {ex.icon} {ex.name}
                    </button>
                  ))}
                  <button className="ex-pill" onClick={() => setAddingExercise(false)} style={{ color: "#444" }}>✕ Cancel</button>
                </div>
              </div>
            )}

            {blocks.some((b) => b.time > 0 || b.distance) && (
              <div className="card" style={{ marginBottom: 16, background: "#0d0d0d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>TOTAL WORKOUT TIME</div>
                    <div style={{ fontSize: "2.2rem", color: "#ff7b00" }}>{formatTime(totalSeconds(blocks))}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>BLOCKS</div>
                    <div style={{ fontSize: "2.2rem", color: "#555" }}>{blocks.length}</div>
                  </div>
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={saveWorkout} style={{ width: "100%", padding: "14px", fontSize: "1.1rem" }}>
              SAVE WORKOUT
            </button>
          </div>
        )}

        {/* ──────────── HISTORY ──────────── */}
        {tab === "history" && (
          <div className="fade-up">
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>
                ALL SESSIONS
              </div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>WORKOUT HISTORY</div>
            </div>

            {viewingWorkout ? (
              <div className="slide-in">
                <button className="btn-ghost" onClick={() => setViewingWorkout(null)} style={{ marginBottom: 16, fontSize: "0.85rem" }}>
                  ← BACK
                </button>
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: "1.7rem", letterSpacing: 2 }}>{viewingWorkout.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#555", fontFamily: "'DM Sans'", marginTop: 3 }}>
                        {viewingWorkout.date} · {viewingWorkout.blocks.length} blocks
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2rem", color: "#ff7b00" }}>{formatTime(viewingWorkout.totalTime)}</div>
                      <div style={{ fontSize: "0.65rem", color: "#555", fontFamily: "'DM Sans'" }}>TOTAL TIME</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#444", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 16 }}>
                    WORKOUT SEQUENCE
                  </div>
                  {viewingWorkout.blocks.map((b: any, i: number) => {
                    const ex = getEx(b.exerciseId);
                    const isRun = b.exerciseId === "run";
                    const dotColor = isRun ? "#3b9eff" : "#ff3c00";
                    return (
                      <div key={b.id || i} style={{ display: "flex", gap: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: isRun ? "#091828" : "#180800", border: `2px solid ${dotColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                            {ex.icon}
                          </div>
                          {i < viewingWorkout.blocks.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 20, background: "#1a1a1a" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingLeft: 14, paddingBottom: i < viewingWorkout.blocks.length - 1 ? 20 : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: "0.62rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'" }}>
                                BLOCK {b.order}
                              </div>
                              <div style={{ fontFamily: "'DM Sans'", fontSize: "1rem", fontWeight: 600, marginTop: 1, color: "#ddd" }}>
                                {ex.name}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              {b.distance && <div style={{ fontFamily: "'DM Sans'", fontSize: "1rem", fontWeight: 700, color: dotColor }}>{b.distance}{b.unit}</div>}
                              {b.time > 0 && <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#888", marginTop: 1 }}>⏱ {formatTime(b.time)}</div>}
                              {b.distance && b.time > 0 && b.unit === "m" && parseFloat(b.distance) > 0 && (
                                <div style={{ fontFamily: "'DM Sans'", fontSize: "0.75rem", color: "#555", marginTop: 1 }}>
                                  {Math.round((b.time / parseFloat(b.distance)) * 1000)}s/km
                                </div>
                              )}
                            </div>
                          </div>
                          {b.notes && (
                            <div style={{ fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#555", fontStyle: "italic", marginTop: 4 }}>
                              {b.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {workoutLog.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "#333", fontFamily: "'DM Sans'" }}>
                    No workouts logged yet.
                  </div>
                ) : (
                  workoutLog.map((w) => (
                    <div
                      key={w.id}
                      className="block-card"
                      style={{ cursor: "pointer", marginBottom: 12 }}
                      onClick={() => setViewingWorkout(w)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#1e1e1e")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: "1.1rem", letterSpacing: 2 }}>{w.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#555", fontFamily: "'DM Sans'", marginTop: 2 }}>
                            {w.date} · {w.blocks.length} blocks
                          </div>
                        </div>
                        <div style={{ fontFamily: "'DM Sans'", fontSize: "1.1rem", color: "#ff7b00", fontWeight: 600 }}>
                          {formatTime(w.totalTime)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {w.blocks.map((b: any, i: number) => {
                          const ex = getEx(b.exerciseId);
                          return (
                            <span
                              key={i}
                              style={{ fontSize: "0.75rem", fontFamily: "'DM Sans'", background: "#161616", border: `1px solid ${b.exerciseId === "run" ? "#1a2d40" : "#1e1e1e"}`, padding: "3px 8px", borderRadius: 12, color: b.exerciseId === "run" ? "#3b9eff" : "#777" }}
                            >
                              {ex.icon} {b.distance}{b.unit}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {/* ──────────── STATION PRs ──────────── */}
        {tab === "prs" && (
          <div className="fade-up">
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>
                BEST EFFORTS
              </div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>STATION PRs</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {EXERCISE_TYPES.map((ex) => {
                const pr = prs[ex.id];
                return (
                  <div key={ex.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "1.7rem" }}>{ex.icon}</div>
                        <div style={{ fontSize: "1rem", letterSpacing: 2, marginTop: 4 }}>{ex.name.toUpperCase()}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {pr ? (
                          <>
                            <div style={{ fontSize: "1.6rem", color: "#ff7b00" }}>{formatTime(pr.time)}</div>
                            <div style={{ fontSize: "0.72rem", color: "#555", fontFamily: "'DM Sans'" }}>{pr.distance}{ex.defaultUnit}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: "1.4rem", color: "#222" }}>--:--</div>
                        )}
                      </div>
                    </div>
                    {pr && (
                      <div style={{ marginTop: 10 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (pr.distance / (ex.defaultUnit === "reps" ? 100 : 1000)) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────── AI COACH ──────────── */}
        {tab === "coach" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>
                POWERED BY CLAUDE
              </div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>AI COACH</div>
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
              {["Build me a 12-week plan", "How do I pace sled push?", "Analyze my weaknesses", "Race day strategy", "Best way to improve SkiErg"].map((p) => (
                <button
                  key={p}
                  onClick={() => setAiInput(p)}
                  style={{ background: "#111", border: "1px solid #1e1e1e", color: "#666", padding: "5px 11px", borderRadius: 16, fontFamily: "'DM Sans'", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#ff3c00"; (e.target as HTMLElement).style.color = "#f0f0f0"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#1e1e1e"; (e.target as HTMLElement).style.color = "#666"; }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div className={`ai-bubble ${m.role}`}>
                    {m.role === "assistant" && (
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#ff3c00", letterSpacing: 2, marginBottom: 5 }}>
                        AI COACH
                      </div>
                    )}
                    <div style={{ whiteSpace: "pre-wrap", fontFamily: "'DM Sans'" }}>{m.content}</div>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: "flex" }}>
                  <div className="ai-bubble assistant">
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#ff3c00", letterSpacing: 2, marginBottom: 5 }}>AI COACH</div>
                    <div style={{ color: "#444", fontFamily: "'DM Sans'" }}>Analyzing ⚡</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="input-field"
                placeholder="Ask your coach anything..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAiMessage()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={sendAiMessage} disabled={aiLoading} style={{ opacity: aiLoading ? 0.5 : 1 }}>
                SEND
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
