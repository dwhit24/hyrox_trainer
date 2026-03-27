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

const UNIT_OPTIONS = ["m", "km", "miles"];

// Hyrox movements that require a weight field
const HYROX_WEIGHTED = ["sled_push", "sled_pull", "farmers_carry", "sandbag_lunges", "wall_balls"];
// Wall balls uses reps instead of distance
const WALL_BALLS_ID = "wall_balls";

const HYROX_MOVEMENTS = [
  { id: "run",            name: "Running",           icon: "🏃" },
  { id: "skierg",         name: "SkiErg",            icon: "⛷️" },
  { id: "sled_push",      name: "Sled Push",         icon: "🛷" },
  { id: "sled_pull",      name: "Sled Pull",         icon: "🔗" },
  { id: "burpee_jump",    name: "Burpee Broad Jump", icon: "💥" },
  { id: "rowing",         name: "Rowing",            icon: "🚣" },
  { id: "farmers_carry",  name: "Farmers Carry",     icon: "💪" },
  { id: "sandbag_lunges", name: "Sandbag Lunges",    icon: "🎒" },
  { id: "wall_balls",     name: "Wall Balls",        icon: "🏀" },
];

const STRENGTH_MOVEMENTS = [
  { id: "back_squat",            name: "Back Squat" },
  { id: "front_squat",           name: "Front Squat" },
  { id: "goblet_squat",          name: "Goblet Squat" },
  { id: "bulgarian_split_squat", name: "Bulgarian Split Squat" },
  { id: "deadlift",              name: "Deadlift" },
  { id: "romanian_deadlift",     name: "Romanian Deadlift" },
  { id: "sumo_deadlift",         name: "Sumo Deadlift" },
  { id: "trap_bar_deadlift",     name: "Trap Bar Deadlift" },
  { id: "bench_press",           name: "Bench Press" },
  { id: "incline_press",         name: "Incline Press" },
  { id: "overhead_press",        name: "Overhead Press" },
  { id: "dumbbell_press",        name: "Dumbbell Press" },
  { id: "pull_up",               name: "Pull-Up / Chin-Up" },
  { id: "barbell_row",           name: "Barbell Row" },
  { id: "cable_row",             name: "Cable Row" },
  { id: "lat_pulldown",          name: "Lat Pulldown" },
  { id: "walking_lunge",         name: "Walking Lunge" },
  { id: "reverse_lunge",         name: "Reverse Lunge" },
  { id: "step_up",               name: "Step-Up" },
  { id: "single_leg_rdl",        name: "Single Leg RDL" },
  { id: "hip_thrust",            name: "Hip Thrust" },
  { id: "good_morning",          name: "Good Morning" },
  { id: "farmers_carry_str",     name: "Farmers Carry (Heavy)" },
  { id: "suitcase_carry",        name: "Suitcase Carry" },
];

const CARDIO_MOVEMENTS = [
  { id: "run_cardio",      name: "Running",        icon: "🏃" },
  { id: "cycling",         name: "Cycling",        icon: "🚴" },
  { id: "stationary_bike", name: "Stationary Bike",icon: "🚲" },
  { id: "ski_machine",     name: "Ski Machine",    icon: "⛷️" },
  { id: "rowing_cardio",   name: "Rowing",         icon: "🚣" },
  { id: "jump_rope",       name: "Jump Rope",      icon: "🪢" },
  { id: "stair_climber",   name: "Stair Climber",  icon: "🪜" },
  { id: "elliptical",      name: "Elliptical",     icon: "🔄" },
];

const ACCESSORY_MOVEMENTS = [
  { id: "plank",           name: "Plank",             group: "Core" },
  { id: "dead_bug",        name: "Dead Bug",           group: "Core" },
  { id: "hollow_body",     name: "Hollow Body Hold",   group: "Core" },
  { id: "russian_twist",   name: "Russian Twist",      group: "Core" },
  { id: "ghd_situp",       name: "GHD Sit-Up",         group: "Core" },
  { id: "pallof_press",    name: "Pallof Press",        group: "Core" },
  { id: "face_pull",       name: "Face Pull",           group: "Core" },
  { id: "band_pull_apart", name: "Band Pull-Apart",     group: "Core" },
  { id: "box_jump",        name: "Box Jump",            group: "Power" },
  { id: "kettlebell_swing",name: "Kettlebell Swing",    group: "Power" },
  { id: "battle_ropes",    name: "Battle Ropes",        group: "Power" },
  { id: "bear_crawl",      name: "Bear Crawl",          group: "Power" },
  { id: "glute_bridge",    name: "Glute Bridge",        group: "Power" },
  { id: "calf_raise",      name: "Calf Raise",          group: "Power" },
  { id: "banded_work",     name: "Banded Work",         group: "Power" },
  { id: "step_up_acc",     name: "Step-Up",             group: "Power" },
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  hyrox:     { label: "HYROX",     color: "#ff3c00" },
  strength:  { label: "STRENGTH",  color: "#3b9eff" },
  cardio:    { label: "CARDIO",    color: "#44cc88" },
  accessory: { label: "ACCESSORY", color: "#ff9900" },
};

function getMovementsForCategory(cat: string) {
  if (cat === "hyrox")     return HYROX_MOVEMENTS;
  if (cat === "strength")  return STRENGTH_MOVEMENTS;
  if (cat === "cardio")    return CARDIO_MOVEMENTS;
  if (cat === "accessory") return ACCESSORY_MOVEMENTS;
  return [];
}

function isStrengthCat(cat: string) {
  return cat === "strength" || cat === "accessory";
}

function getMovementName(cat: string, id: string) {
  const list = getMovementsForCategory(cat) as any[];
  return list.find((m) => m.id === id)?.name || id;
}

function getMovementIcon(cat: string, id: string) {
  const list = getMovementsForCategory(cat) as any[];
  return (list.find((m) => m.id === id) as any)?.icon || "";
}


const FOCUS_AREAS = [
  { id: "running", label: "Running" },
  { id: "skierg", label: "SkiErg" },
  { id: "sled", label: "Sled Push/Pull" },
  { id: "carries", label: "Carries & Lunges" },
  { id: "wall_balls", label: "Wall Balls" },
  { id: "rowing", label: "Rowing" },
  { id: "strength", label: "Strength" },
];

const RACE_WEIGHTS: Record<string, Record<string, string>> = {
  open_man:  { sledPush: "102kg", sledPull: "78kg",  farmersCarry: "2×24kg", sandbagLunges: "10kg", wallBalls: "4kg (10ft)" },
  open_woman:{ sledPush: "62kg",  sledPull: "48kg",  farmersCarry: "2×16kg", sandbagLunges: "6kg",  wallBalls: "3kg (9ft)"  },
  pro_man:   { sledPush: "152kg", sledPull: "103kg", farmersCarry: "2×32kg", sandbagLunges: "20kg", wallBalls: "6kg (10ft)" },
  pro_woman: { sledPush: "102kg", sledPull: "78kg",  farmersCarry: "2×24kg", sandbagLunges: "10kg", wallBalls: "4kg (10ft)" },
};

// ---------------------------------------------------------------------------
// Plan generation helpers
// ---------------------------------------------------------------------------
function buildExercises(type: string, phase: string, level: string, division = "open", gender = "man"): any[] {
  const isPeak = phase === "peak";
  const isBuild = phase === "build";
  const isTaper = phase === "taper";
  const adv = level === "competitive";
  const beg = level === "beginner";
  const rw = RACE_WEIGHTS[`${division}_${gender}`] || RACE_WEIGHTS["open_man"];

  if (type === "strength_lower") {
    if (isTaper) return [
      { name: "Back Squat", sets: 3, reps: "5", weight: "Moderate — keep it crisp" },
      { name: "Romanian Deadlift", sets: 3, reps: "8", weight: "Moderate" },
      { name: "Walking Lunges", sets: 2, reps: "8/leg", weight: "Bodyweight" },
    ];
    if (isPeak) return [
      { name: "Back Squat", sets: 4, reps: adv ? "4-5" : "5-6", weight: adv ? "85% 1RM" : "Heavy" },
      { name: "Romanian Deadlift", sets: 4, reps: "6-8", weight: "Heavy" },
      { name: "Hip Thrust", sets: 3, reps: "8-10", weight: "Heavy" },
      { name: "Weighted Walking Lunges", sets: 4, reps: "10/leg", weight: "Moderate-heavy" },
      { name: "Box Step-Up", sets: 3, reps: "8/leg", weight: "Moderate" },
    ];
    if (isBuild) return [
      { name: "Back Squat", sets: 4, reps: "6-8", weight: "70-75% 1RM" },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10", weight: "Moderate-heavy" },
      { name: "Hip Thrust", sets: 3, reps: "10-12", weight: "Moderate-heavy" },
      { name: "Walking Lunges", sets: 3, reps: "12/leg", weight: beg ? "Bodyweight" : "Light dumbbells" },
      { name: "Calf Raises", sets: 3, reps: "20" },
    ];
    return [
      { name: "Back Squat", sets: 3, reps: "8-10", weight: beg ? "Bodyweight or light bar" : "60-65% 1RM" },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "Moderate" },
      { name: "Hip Thrust", sets: 3, reps: "12-15", weight: "Light-moderate" },
      { name: "Walking Lunges", sets: 3, reps: "10/leg", weight: "Bodyweight" },
    ];
  }

  if (type === "strength_upper") {
    if (isTaper) return [
      { name: "Bent-Over Row", sets: 3, reps: "6", weight: "Moderate" },
      { name: "Overhead Press", sets: 3, reps: "6", weight: "Moderate" },
      { name: "Farmer Carry", sets: 3, distance: "30m", weight: "Moderate" },
    ];
    if (isPeak) return [
      { name: "Bent-Over Row", sets: 4, reps: adv ? "5-6" : "6-8", weight: "Heavy" },
      { name: "Overhead Press", sets: 4, reps: "6-8", weight: "Heavy" },
      { name: "Pull-Ups", sets: 4, reps: "6-8", notes: "Weighted if able" },
      { name: "Face Pulls", sets: 3, reps: "15", weight: "Light" },
      { name: "Farmer Carry", sets: 4, distance: "50m", weight: "Heavy — race-weight kettlebells" },
    ];
    if (isBuild) return [
      { name: "Bent-Over Row", sets: 4, reps: "8-10", weight: "Moderate-heavy" },
      { name: "Overhead Press", sets: 3, reps: "8-10", weight: "Moderate" },
      { name: "Pull-Ups or Lat Pulldown", sets: 3, reps: "8-10" },
      { name: "Face Pulls", sets: 3, reps: "15-20", weight: "Light" },
      { name: "Farmer Carry", sets: 4, distance: "40m", weight: "Heavy" },
    ];
    return [
      { name: "Bent-Over Row", sets: 3, reps: "10-12", weight: "Moderate" },
      { name: "Overhead Press", sets: 3, reps: "10-12", weight: "Light-moderate" },
      { name: "Lat Pulldown", sets: 3, reps: "12-15", weight: "Moderate" },
      { name: "Face Pulls", sets: 3, reps: "15-20", weight: "Light" },
      { name: "Farmer Carry", sets: 3, distance: "30m", weight: "Moderate kettlebells" },
    ];
  }

  if (type === "stations") {
    if (isTaper) return [
      { name: "SkiErg", sets: 3, distance: "500m", notes: "Easy effort, 2min rest" },
      { name: "Rowing", sets: 3, distance: "500m", notes: "Easy effort, 2min rest" },
      { name: "Wall Balls", sets: 2, reps: "15 reps", notes: "Light, 90s rest" },
    ];
    if (isPeak) return [
      { name: "SkiErg", sets: adv ? 5 : 4, distance: "750m", notes: "Race pace, 2min rest" },
      { name: "Rowing", sets: adv ? 5 : 4, distance: "750m", notes: "Race pace, 2min rest" },
      { name: "Burpee Broad Jump", sets: 4, distance: "25m", notes: "Max effort, 90s rest" },
      { name: "Wall Balls", sets: 4, reps: "25 reps", notes: "Race weight, 90s rest" },
    ];
    if (isBuild) return [
      { name: "SkiErg", sets: 4, distance: "500m", notes: "Strong effort, 90s rest" },
      { name: "Rowing", sets: 4, distance: "500m", notes: "Strong effort, 90s rest" },
      { name: "Burpee Broad Jump", sets: 4, distance: "20m", notes: "80% effort, 75s rest" },
      { name: "Wall Balls", sets: 4, reps: "20 reps", notes: "Race weight, 75s rest" },
    ];
    return [
      { name: "SkiErg", sets: 3, distance: "500m", notes: "Moderate effort, 2min rest" },
      { name: "Rowing", sets: 3, distance: "500m", notes: "Moderate effort, 2min rest" },
      { name: "Burpee Broad Jump", sets: 3, distance: "15m", notes: "Controlled, 90s rest" },
      { name: "Wall Balls", sets: 3, reps: "15 reps", notes: "Moderate weight, 90s rest" },
    ];
  }

  if (type === "sled_carry") {
    if (isTaper) return [
      { name: "Sled Push", sets: 3, distance: "25m", notes: `Race weight ${rw.sledPush}, 2min rest` },
      { name: "Sled Pull", sets: 3, distance: "25m", notes: `Race weight ${rw.sledPull}, 2min rest` },
      { name: "Sandbag Lunges", sets: 2, distance: "20m", notes: `Race weight ${rw.sandbagLunges}, 2min rest` },
    ];
    if (isPeak) return [
      { name: "Sled Push", sets: adv ? 7 : 6, distance: "25m", notes: `Race weight ${rw.sledPush} or heavier, 2min rest` },
      { name: "Sled Pull", sets: adv ? 7 : 6, distance: "25m", notes: `Race weight ${rw.sledPull} or heavier, 2min rest` },
      { name: "Farmer Carry", sets: 4, distance: "50m", notes: `${rw.farmersCarry} race weight, 90s rest` },
      { name: "Sandbag Lunges", sets: 4, distance: "25m", notes: `Race weight ${rw.sandbagLunges}, 90s rest` },
    ];
    if (isBuild) return [
      { name: "Sled Push", sets: 5, distance: "25m", notes: `80-90% race weight (target ${rw.sledPush}), 2min rest` },
      { name: "Sled Pull", sets: 5, distance: "25m", notes: `80-90% race weight (target ${rw.sledPull}), 2min rest` },
      { name: "Farmer Carry", sets: 4, distance: "40m", notes: `${rw.farmersCarry} or close, 90s rest` },
      { name: "Sandbag Lunges", sets: 3, distance: "20m", notes: `${rw.sandbagLunges} race weight, 90s rest` },
    ];
    return [
      { name: "Sled Push", sets: 4, distance: "25m", notes: `60-70% race weight (target ${rw.sledPush}), 2min rest` },
      { name: "Sled Pull", sets: 4, distance: "25m", notes: `60-70% race weight (target ${rw.sledPull}), 2min rest` },
      { name: "Farmer Carry", sets: 3, distance: "30m", notes: `Light-moderate, building to ${rw.farmersCarry}, 90s rest` },
      { name: "Sandbag Lunges", sets: 3, distance: "15m", notes: `Light sandbag, building to ${rw.sandbagLunges}, 90s rest` },
    ];
  }
  return [];
}

function buildRunSession(phase: string, level: string, runType: string): any {
  const adv = level === "competitive";
  const beg = level === "beginner";
  const isTaper = phase === "taper";
  const isPeak = phase === "peak";
  const isBuild = phase === "build";

  if (runType === "easy") {
    const dist = isTaper ? "3km" : isPeak ? (adv ? "6km" : "5km") : isBuild ? (adv ? "5km" : "4km") : beg ? "3km" : "4km";
    return { type: "run", name: "Easy Run", description: "Zone 2 — conversational pace the whole way. Build your aerobic base.", duration: parseInt(dist) * 7, exercises: [{ name: "Easy run", distance: dist, notes: "Zone 2, conversational pace, 60-70% max HR" }] };
  }
  if (runType === "tempo") {
    const dist = isPeak ? (adv ? "5km" : "4km") : adv ? "4km" : "3km";
    return { type: "run", name: "Tempo Run", description: "Comfortably hard — you can speak a few words but not a full sentence.", duration: 35, exercises: [{ name: "Warm-up jog", distance: "1km" }, { name: "Tempo run", distance: dist, notes: "Race pace or slightly faster" }, { name: "Cool-down jog", distance: "1km" }] };
  }
  if (runType === "intervals") {
    const sets = isPeak ? (adv ? 8 : 6) : adv ? 6 : 5;
    const dist = isPeak ? "600m" : "400m";
    return { type: "run", name: "Run Intervals", description: "Hard effort with full recovery between reps. Quality over quantity.", duration: 45, exercises: [{ name: "Warm-up jog", distance: "1km", notes: "Easy + strides" }, { name: `${dist} repeats`, sets, reps: `×${dist}`, notes: `Race effort, ${isPeak ? "2min" : "90s"} rest` }, { name: "Cool-down jog", distance: "1km" }] };
  }
  if (runType === "long") {
    const dist = isPeak ? (adv ? "10km" : "8km") : isBuild ? (adv ? "8km" : "6km") : adv ? "6km" : "5km";
    return { type: "run", name: "Long Run", description: "Build aerobic base and mental toughness. Keep it easy — Zone 2 all the way.", duration: parseInt(dist) * 6, exercises: [{ name: "Long easy run", distance: dist, notes: "Zone 2 the whole way" }] };
  }
  return { type: "run", name: "Run", exercises: [] };
}

function buildRaceSimSession(full: boolean): any {
  if (full) return {
    type: "race_sim", name: "Full Race Simulation", description: "Complete Hyrox format at race effort. Treat it exactly like race day.", duration: 90,
    exercises: [
      { name: "1km Run", notes: "Race pace" }, { name: "SkiErg — 1000m" }, { name: "1km Run" }, { name: "Sled Push — 50m" },
      { name: "1km Run" }, { name: "Sled Pull — 50m" }, { name: "1km Run" }, { name: "Burpee Broad Jump — 80m" },
      { name: "1km Run" }, { name: "Rowing — 1000m" }, { name: "1km Run" }, { name: "Farmers Carry — 200m" },
      { name: "1km Run" }, { name: "Sandbag Lunges — 100m" }, { name: "1km Run" }, { name: "Wall Balls — 100 reps" },
    ],
  };
  return {
    type: "race_sim", name: "Half Race Simulation", description: "4 runs + 4 stations at race effort. Perfect peak week sharpener.", duration: 55,
    exercises: [
      { name: "1km Run", notes: "Race pace" }, { name: "SkiErg — 500m", notes: "Race effort" },
      { name: "1km Run" }, { name: "Sled Push — 25m", notes: "Race weight" },
      { name: "1km Run" }, { name: "Rowing — 500m", notes: "Race effort" },
      { name: "1km Run" }, { name: "Wall Balls — 50 reps", notes: "Race weight" },
    ],
  };
}

function generateWeekSessions(phase: string, form: any): any[] {
  const { daysPerWeek, fitnessLevel, division = "open", gender = "man" } = form;
  const isPeak = phase === "peak";
  const isBuild = phase === "build";
  const isCompetitive = fitnessLevel === "competitive";
  const runType = isPeak ? "intervals" : isBuild ? "tempo" : "easy";
  const ex = (t: string) => buildExercises(t, phase, fitnessLevel, division, gender);

  const templates: Record<number, any[]> = {
    3: [
      { type: "strength", name: "Lower Body Strength", description: "Squats, deadlifts, and posterior chain work to power your sled and lunges.", duration: 55, exercises: ex("strength_lower") },
      { type: "station", name: "Station Intervals", description: "Hyrox station-specific work. Focus on pacing and form over raw speed.", duration: 50, exercises: ex("stations") },
      buildRunSession(phase, fitnessLevel, runType),
    ],
    4: [
      { type: "strength", name: "Lower Body Strength", description: "Squats, deadlifts, and posterior chain work.", duration: 55, exercises: ex("strength_lower") },
      { type: "station", name: "Station Intervals", description: "Hyrox station-specific work.", duration: 50, exercises: ex("stations") },
      buildRunSession(phase, fitnessLevel, "easy"),
      isPeak ? buildRaceSimSession(isCompetitive) : { type: "strength", name: "Upper Body & Pull", description: "Rowing strength, carries, and upper body pulling power.", duration: 50, exercises: ex("strength_upper") },
    ],
    5: [
      { type: "strength", name: "Lower Body Strength", description: "Squats, deadlifts, and posterior chain work.", duration: 55, exercises: ex("strength_lower") },
      { type: "station", name: "Station Intervals", description: "Hyrox station-specific work.", duration: 50, exercises: ex("stations") },
      buildRunSession(phase, fitnessLevel, "easy"),
      { type: "strength", name: "Upper Body & Pull", description: "Rowing strength, carries, and upper body pulling power.", duration: 50, exercises: ex("strength_upper") },
      isPeak ? buildRaceSimSession(isCompetitive) : buildRunSession(phase, fitnessLevel, isBuild ? "tempo" : "intervals"),
    ],
    6: [
      { type: "strength", name: "Lower Body Strength", description: "Squats, deadlifts, and posterior chain work.", duration: 55, exercises: ex("strength_lower") },
      { type: "station", name: "Station Intervals", description: "Hyrox station-specific cardio work.", duration: 50, exercises: ex("stations") },
      buildRunSession(phase, fitnessLevel, "easy"),
      { type: "strength", name: "Upper Body & Pull", description: "Rowing strength, carries, and upper body pulling power.", duration: 50, exercises: ex("strength_upper") },
      { type: "station", name: "Sled & Carry Work", description: "Sled push/pull and loaded carries — the race makers or breakers.", duration: 55, exercises: ex("sled_carry") },
      isPeak ? buildRaceSimSession(isCompetitive) : buildRunSession(phase, fitnessLevel, "long"),
    ],
  };

  return (templates[daysPerWeek] || templates[4]).map((s: any, i: number) => ({ ...s, dayNumber: i + 1 }));
}

function generatePlan(form: { raceDate: string; fitnessLevel: string; daysPerWeek: number; focusAreas: string[]; hasGym: boolean }) {
  const today = new Date();
  let weeksTotal = 8;
  if (form.raceDate) {
    const diffWeeks = Math.round((new Date(form.raceDate).getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
    weeksTotal = Math.max(4, Math.min(20, diffWeeks));
  }
  const baseEnd = Math.max(1, Math.ceil(weeksTotal * 0.35));
  const buildEnd = Math.max(baseEnd + 1, Math.ceil(weeksTotal * 0.70));
  const peakEnd = Math.max(buildEnd + 1, Math.ceil(weeksTotal * 0.90));

  const weeks = Array.from({ length: weeksTotal }, (_, i) => {
    const w = i + 1;
    const phase = w > peakEnd ? "taper" : w > buildEnd ? "peak" : w > baseEnd ? "build" : "base";
    return { weekNumber: w, phase, sessions: generateWeekSessions(phase, form) };
  });
  return { ...form, weeksTotal, weeks };
}

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
  return blocks.reduce((sum, b) => {
    if (isStrengthCat(b.category)) return sum;
    if (b.hyroxSets?.length) return sum + b.hyroxSets.reduce((s: number, hs: any) => s + (hs.time || 0), 0);
    return sum + (b.time || 0);
  }, 0);
}

const emptyHyroxSet = () => ({ dist: "", reps: "", weight: "", timeInput: "", time: 0 });

const emptyBlock = () => ({
  id: Date.now() + Math.random(),
  category: "hyrox",
  movementId: "",
  customMovement: "",
  movementSearch: "",
  distance: "",
  unit: "m",
  timeInput: "",
  time: 0,
  hyroxWeight: "",
  numSets: 3,
  sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }],
  hyroxNumSets: 1,
  hyroxSets: [emptyHyroxSet()],
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
  .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #0d0d0d; border-top: 1px solid #1c1c1c; display: flex; z-index: 100; padding-bottom: env(safe-area-inset-bottom); }
  .bottom-nav-btn { flex: 1; background: none; border: none; color: #555; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px 8px; transition: color 0.2s; gap: 3px; -webkit-tap-highlight-color: transparent; }
  .bottom-nav-btn.active { color: #ff3c00; }
  .bottom-nav-btn:hover { color: #aaa; }
  .bottom-nav-icon { font-size: 1.3rem; line-height: 1; }
  .bottom-nav-label { font-size: 0.6rem; letter-spacing: 0.5px; font-family: 'DM Sans', sans-serif; text-transform: uppercase; }
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
  html, body { overflow: hidden; height: 100%; background: #0a0a0a; }
  .header-email { font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #444; }
  .btn-logout { }
  @media (max-width: 600px) {
    .header-email { display: none; }
    .btn-logout { display: none; }
    .btn-primary.btn-log-workout { padding: 7px 12px !important; font-size: 0.8rem !important; letter-spacing: 1px !important; }
  }
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
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set());
  const [lastSessions, setLastSessions] = useState<Record<string, any>>({});
  const fetchedMovements = useRef<Set<string>>(new Set());

  // Profile state
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Plan state
  const [activePlan, setActivePlan] = useState<any>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({ raceDate: "", fitnessLevel: "intermediate", daysPerWeek: 4, focusAreas: [] as string[], hasGym: true, division: "open" });

  // AI Coach state
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "Hey athlete 👋 I'm your Hyrox AI coach. Ask me anything — race strategy, training plans, station tips, or review your progress." },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
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
        if (!session.user.user_metadata?.gender) setShowProfileSetup(true);
        loadWorkouts();
        loadPlan();
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
        if (!currentUser.user_metadata?.gender) setShowProfileSetup(true);
        loadWorkouts();
        loadPlan();
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

  async function loadPlan() {
    const { data } = await supabase
      .from("training_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setActivePlan(data);
      try {
        const stored = localStorage.getItem(`completed_${data.id}`);
        if (stored) setCompletedSessions(new Set(JSON.parse(stored)));
        else setCompletedSessions(new Set());
      } catch { setCompletedSessions(new Set()); }
    }
  }

  function toggleSessionComplete(weekIdx: number, sessionIdx: number) {
    const key = `${weekIdx}-${sessionIdx}`;
    setCompletedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (activePlan?.id) {
        localStorage.setItem(`completed_${activePlan.id}`, JSON.stringify([...next]));
      }
      return next;
    });
  }

  async function savePlan(planData: any) {
    if (!user) return;
    setGeneratingPlan(true);
    await supabase.from("training_plans").delete().eq("user_id", user.id);
    const { data, error } = await supabase.from("training_plans").insert({
      user_id: user.id,
      race_date: planData.raceDate || null,
      fitness_level: planData.fitnessLevel,
      days_per_week: planData.daysPerWeek,
      focus_areas: planData.focusAreas,
      has_gym: planData.hasGym,
      weeks_data: planData.weeks,
    }).select().single();
    if (data) setActivePlan(data);
    if (error) console.error("Error saving plan:", error);
    setGeneratingPlan(false);
  }

  async function saveWorkout() {
    const validBlocks = blocks.filter((b) => b.movementId || b.customMovement);
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

    const blockInserts = validBlocks.map((b, i) => {
      const isStr = isStrengthCat(b.category);
      const hyroxTotal = (b.hyroxSets || []).reduce((s: number, hs: any) => s + (hs.time || 0), 0);
      const hyroxFirstDist = b.hyroxSets?.[0]?.dist || b.distance || "";
      return {
        workout_id: workout.id,
        exercise_id: b.movementId || "custom",
        distance: isStr ? String(b.numSets) : hyroxFirstDist,
        unit: isStr ? "sets" : b.unit,
        time: isStr ? 0 : hyroxTotal,
        time_input: b.timeInput || "",
        notes: JSON.stringify({ category: b.category, customMovement: b.customMovement, sets: b.sets, hyroxSets: b.hyroxSets, weightUnit, hyroxWeight: b.hyroxWeight, notes: b.notes }),
        block_order: i + 1,
      };
    });

    await supabase.from("workout_blocks").insert(blockInserts);
    await loadWorkouts();
    setBlocks([emptyBlock()]);
    setWorkoutName("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  // ---------------------------------------------------------------------------
  // Auth functions
  // ---------------------------------------------------------------------------
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError("✓ Check your email for a reset link.");
    }
    setAuthSubmitting(false);
  }

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
        if (field === "category") {
          updated.movementId = "";
          updated.customMovement = "";
          updated.unit = "m";
          updated.hyroxNumSets = 1;
          updated.hyroxSets = [emptyHyroxSet()];
        }
        if (field === "numSets") {
          const n = Math.max(1, Number(value));
          const cur = b.sets || [];
          updated.sets = n > cur.length
            ? [...cur, ...Array(n - cur.length).fill({ reps: "", weight: "" })]
            : cur.slice(0, n);
          updated.numSets = n;
        }
        if (field === "hyroxNumSets") {
          const n = Math.max(1, Number(value));
          const cur = b.hyroxSets || [];
          updated.hyroxSets = n > cur.length
            ? [...cur, ...Array(n - cur.length).fill(null).map(emptyHyroxSet)]
            : cur.slice(0, n);
          updated.hyroxNumSets = n;
        }
        if (field === "timeInput") updated.time = parseTimeInput(value);
        return updated;
      })
    );
    if (field === "movementId" && value && value !== "custom") {
      fetchLastSession(value);
    }
  }

  function updateSet(blockId: number, setIdx: number, field: "reps" | "weight", value: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const sets = b.sets.map((s: any, i: number) => i === setIdx ? { ...s, [field]: value } : s);
        return { ...b, sets };
      })
    );
  }

  function updateHyroxSet(blockId: number, setIdx: number, field: string, value: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const hyroxSets = (b.hyroxSets || []).map((s: any, i: number) => {
          if (i !== setIdx) return s;
          const upd = { ...s, [field]: value };
          if (field === "timeInput") upd.time = parseTimeInput(value);
          return upd;
        });
        return { ...b, hyroxSets };
      })
    );
  }

  async function fetchLastSession(movementId: string) {
    if (!user || !movementId || movementId === "custom") return;
    if (fetchedMovements.current.has(movementId)) return;
    fetchedMovements.current.add(movementId);
    const { data } = await supabase
      .from("workout_blocks")
      .select("*")
      .eq("exercise_id", movementId)
      .order("workout_id", { ascending: false })
      .limit(1);
    if (data?.[0]) {
      setLastSessions((prev) => ({ ...prev, [movementId]: parseBlock(data[0]) }));
    }
  }

  function addBlock() {
    setBlocks((prev) => [...prev, emptyBlock()]);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an elite Hyrox coach with deep expertise in both Hyrox-specific training and the strength & conditioning work that underpins it. Hyrox race format: 8x 1km runs each followed by one station in order — SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad Jump 80m, Rowing 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls 100 reps. When building training plans, always include BOTH: (1) Hyrox-specific station work and running, AND (2) complementary strength & weightlifting sessions — including compound lifts like deadlifts, squats, Romanian deadlifts, hip thrusts, bent-over rows, overhead press, and lunges that build the posterior chain, leg drive, and grip strength needed for sled, carry, and lunge stations. Balance aerobic capacity, muscular endurance, and raw strength across the week. Be specific with sets, reps, weights (suggest ranges), rest periods, and pacing. Be motivating and data-driven. Athlete context: ${logSummary}`,
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

  function parseBlock(b: any) {
    try {
      const j = JSON.parse(b.notes);
      if (j && j.category) return { ...b, category: j.category, customMovement: j.customMovement || "", sets: j.sets || null, hyroxSets: j.hyroxSets || null, weightUnit: j.weightUnit || "kg", hyroxWeight: j.hyroxWeight || "", parsedNotes: j.notes || "" };
    } catch {}
    return { ...b, category: "hyrox", customMovement: "", sets: null, hyroxSets: null, weightUnit: "kg", hyroxWeight: "", parsedNotes: b.notes || "" };
  }

  // Compute PRs from workout log
  const prs: Record<string, any> = {};
  EXERCISE_TYPES.forEach((ex) => {
    const efforts = workoutLog.flatMap((w) =>
      w.blocks
        .filter((b: any) => b.exerciseId === ex.id && b.time && b.distance)
        .map((b: any) => ({ time: b.time, distance: parseFloat(b.distance), date: w.date }))
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
              {authMode === "login" ? "SIGN IN" : authMode === "reset" ? "RESET PASSWORD" : "CREATE ACCOUNT"}
            </div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#555", marginBottom: 24 }}>
              {authMode === "login" ? "Welcome back, athlete." : authMode === "reset" ? "Enter your email and we'll send a reset link." : "Join and start tracking your Hyrox journey."}
            </div>

            <form onSubmit={authMode === "reset" ? handleResetPassword : handleAuth}>
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
              {authMode !== "reset" && (
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
              )}

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
                {authSubmitting ? "..." : authMode === "login" ? "SIGN IN" : authMode === "reset" ? "SEND RESET EMAIL" : "CREATE ACCOUNT"}
              </button>
            </form>

            {/* Forgot password link — only on login screen */}
            {authMode === "login" && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button
                  onClick={() => { setAuthMode("reset"); setAuthError(""); }}
                  style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.78rem", textDecoration: "underline" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: 16,
                fontFamily: "'DM Sans'",
                fontSize: "0.82rem",
                color: "#555",
              }}
            >
              {authMode === "reset" ? "Remember it? " : authMode === "login" ? "Don't have an account? " : "Already have an account? "}
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
                {authMode === "reset" ? "Sign in" : authMode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Profile setup (shown once after first sign-up)
  // ---------------------------------------------------------------------------
  if (showProfileSetup) {
    return (
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", background: "#0a0a0a", height: "100vh", color: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: "2.6rem", letterSpacing: 5, marginBottom: 8 }}>HYROX</div>
          <div style={{ fontSize: "0.75rem", color: "#ff3c00", letterSpacing: 3, fontFamily: "'DM Sans'", fontWeight: 700, marginBottom: 48 }}>TRAINER</div>
          <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 8 }}>ONE LAST THING</div>
          <div style={{ fontSize: "2rem", letterSpacing: 3, marginBottom: 12 }}>WHO ARE YOU?</div>
          <div style={{ fontSize: "0.85rem", color: "#555", fontFamily: "'DM Sans'", marginBottom: 36, lineHeight: 1.6 }}>
            This helps us set the right Hyrox weights and goals for your training.
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {["Man", "Woman"].map(g => (
              <button key={g} className="btn-primary" style={{ flex: 1, fontSize: "1.3rem", letterSpacing: 3, padding: "18px 0", background: "#111", border: "1px solid #252525", color: "#888" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ff3c00"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#ff3c00"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#111"; (e.currentTarget as HTMLElement).style.color = "#888"; (e.currentTarget as HTMLElement).style.borderColor = "#252525"; }}
                onClick={async () => {
                  await supabase.auth.updateUser({ data: { gender: g.toLowerCase() } });
                  setShowProfileSetup(false);
                }}>
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main app
  // ---------------------------------------------------------------------------
  return (
    <div ref={scrollContainerRef} style={{ fontFamily: "'Bebas Neue', sans-serif", background: "#0a0a0a", height: "100vh", overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any, color: "#f0f0f0" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Header ── */}
      <div
        style={{
          background: "#0c0c0c",
          borderBottom: "1px solid #1a1a1a",
          padding: "0 20px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: "1.9rem", letterSpacing: 5, color: "#fff" }}>HYROX</span>
              <span style={{ fontSize: "0.8rem", color: "#ff3c00", fontFamily: "'DM Sans'", fontWeight: 700, letterSpacing: 2 }}>
                TRAINER
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="header-email">{user.email}</span>
              <button
                className="btn-ghost btn-logout"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                onClick={handleLogout}
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px", paddingTop: "70px", paddingBottom: "calc(300px + env(safe-area-inset-bottom))" }}>

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
                      No workouts yet. Tap <span style={{ color: "#ff3c00" }}>➕ Log</span> below to start! 💪
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

                {/* PRs card */}
                <div
                  className="card"
                  onClick={() => setTab("prs")}
                  style={{ marginTop: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#ff3c00")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#1c1c1c")}
                >
                  <div>
                    <div style={{ fontSize: "1.1rem", letterSpacing: 3, color: "#666", marginBottom: 6 }}>STATION PRs</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {EXERCISE_TYPES.filter(ex => prs[ex.id]).slice(0, 4).map(ex => (
                        <div key={ex.id} style={{ fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#888" }}>
                          {ex.icon} <span style={{ color: "#ff7b00" }}>{formatTime(prs[ex.id]?.time)}</span>
                        </div>
                      ))}
                      {EXERCISE_TYPES.filter(ex => prs[ex.id]).length === 0 && (
                        <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#333" }}>Log workouts to track your PRs</div>
                      )}
                    </div>
                  </div>
                  <div style={{ color: "#333", fontSize: "1rem", marginLeft: 10 }}>›</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ──────────── LOG WORKOUT ──────────── */}
        {tab === "log" && (
          <div className="fade-up">
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>BUILD YOUR SESSION</div>
              <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>LOG WORKOUT</div>
            </div>

            {saveSuccess && (
              <div style={{ background: "#0a1f10", border: "1px solid #1e5c2a", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#44cc88", fontSize: "1.1rem" }}>✓</span>
                <span style={{ color: "#44cc88", fontFamily: "'DM Sans'", fontSize: "0.88rem", letterSpacing: 2 }}>WORKOUT SAVED</span>
              </div>
            )}

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'", display: "block", marginBottom: 5 }}>DATE</label>
                  <input className="input-field" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.68rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'", display: "block", marginBottom: 5 }}>WORKOUT NAME (optional)</label>
                  <input className="input-field" placeholder="e.g. Saturday Hyrox Sim" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 12 }}>WORKOUT BLOCKS — IN ORDER</div>
              {blocks.map((block, idx) => {
                const catColor = CATEGORY_META[block.category]?.color || "#ff3c00";
                const movements = getMovementsForCategory(block.category);
                const isStrength = isStrengthCat(block.category);
                const isWallBalls = block.category === "hyrox" && block.movementId === WALL_BALLS_ID;
                const isWeightedHyrox = block.category === "hyrox" && HYROX_WEIGHTED.includes(block.movementId) && !isWallBalls;
                return (
                  <div key={block.id} className="block-card slide-in">
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div className="block-number">{idx + 1}</div>
                      <div style={{ width: 6, height: 6, background: catColor, borderRadius: "50%", flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: "0.82rem", color: "#555", fontFamily: "'DM Sans'", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {block.movementId ? (block.movementId === "custom" ? block.customMovement || "Custom" : getMovementName(block.category, block.movementId)) : "Select movement below"}
                      </div>
                      <button className="icon-btn" onClick={() => moveBlock(block.id, "up")}>↑</button>
                      <button className="icon-btn" onClick={() => moveBlock(block.id, "down")}>↓</button>
                      <button className="icon-btn danger" onClick={() => removeBlock(block.id)}>✕</button>
                    </div>

                    {/* Category selector */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                      {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                        <button key={cat} onClick={() => updateBlock(block.id, "category", cat)} style={{ flex: 1, padding: "7px 2px", background: block.category === cat ? meta.color + "22" : "#161616", border: `1px solid ${block.category === cat ? meta.color : "#252525"}`, color: block.category === cat ? meta.color : "#555", borderRadius: 5, cursor: "pointer", fontFamily: "'Bebas Neue'", fontSize: "0.68rem", letterSpacing: 1, transition: "all 0.15s" }}>
                          {meta.label}
                        </button>
                      ))}
                    </div>

                    {/* Movement picker */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'", marginBottom: 8 }}>MOVEMENT</div>
                      <input
                        className="input-field"
                        placeholder="Search movements..."
                        value={block.movementSearch || ""}
                        onChange={(e) => updateBlock(block.id, "movementSearch", e.target.value)}
                        style={{ marginBottom: 8, fontSize: "0.82rem" }}
                      />
                      <div key={block.id + "-" + block.category} style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflowY: "auto", paddingBottom: 2 }}>
                        {movements.filter((m: any) => !block.movementSearch || m.name.toLowerCase().includes((block.movementSearch || "").toLowerCase())).map((m: any) => {
                          const sel = block.movementId === m.id;
                          return (
                            <button key={m.id} onClick={() => updateBlock(block.id, "movementId", m.id)} style={{ background: sel ? catColor + "22" : "#161616", border: `1px solid ${sel ? catColor : "#222"}`, color: sel ? catColor : "#aaa", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.8rem", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                              {m.icon ? `${m.icon} ` : ""}{m.name}
                            </button>
                          );
                        })}
                        {(!(block.movementSearch) || "custom".includes((block.movementSearch || "").toLowerCase())) && (
                          <button onClick={() => updateBlock(block.id, "movementId", "custom")} style={{ background: block.movementId === "custom" ? catColor + "22" : "#161616", border: `1px solid ${block.movementId === "custom" ? catColor : "#222"}`, color: block.movementId === "custom" ? catColor : "#555", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.8rem", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                            ✏️ Custom...
                          </button>
                        )}
                      </div>
                      {block.movementId === "custom" && (
                        <input className="input-field" placeholder="Type exercise name..." value={block.customMovement} onChange={(e) => updateBlock(block.id, "customMovement", e.target.value)} style={{ marginTop: 8 }} />
                      )}
                    </div>

                    {/* Strength / Accessory: sets */}
                    {isStrength ? (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>SETS</span>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <button onClick={() => updateBlock(block.id, "numSets", (block.numSets || 1) - 1)} style={{ width: 30, height: 30, background: "#161616", border: "1px solid #252525", color: "#aaa", borderRadius: "5px 0 0 5px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "1.1rem", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                              <div style={{ width: 38, height: 30, background: catColor + "22", border: `1px solid ${catColor}`, borderLeft: "none", borderRight: "none", color: catColor, fontFamily: "'DM Sans'", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{block.numSets}</div>
                              <button onClick={() => updateBlock(block.id, "numSets", (block.numSets || 1) + 1)} style={{ width: 30, height: 30, background: "#161616", border: "1px solid #252525", color: "#aaa", borderRadius: "0 5px 5px 0", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "1.1rem", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                            </div>
                          </div>
                          <div style={{ display: "flex" }}>
                            <button onClick={() => setWeightUnit("kg")} style={{ padding: "5px 12px", background: weightUnit === "kg" ? catColor + "22" : "#111", border: `1px solid ${weightUnit === "kg" ? catColor : "#252525"}`, color: weightUnit === "kg" ? catColor : "#555", borderRadius: "5px 0 0 5px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.75rem", transition: "all 0.15s" }}>kg</button>
                            <button onClick={() => setWeightUnit("lbs")} style={{ padding: "5px 12px", background: weightUnit === "lbs" ? catColor + "22" : "#111", border: `1px solid ${weightUnit === "lbs" ? catColor : "#252525"}`, borderLeft: "none", color: weightUnit === "lbs" ? catColor : "#555", borderRadius: "0 5px 5px 0", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.75rem", transition: "all 0.15s" }}>lbs</button>
                          </div>
                        </div>
                        {/* Last session reference — strength */}
                        {block.movementId && lastSessions[block.movementId]?.sets && (() => {
                          const ls = lastSessions[block.movementId];
                          const valid = ls.sets.filter((s: any) => s.reps);
                          if (!valid.length) return null;
                          const summary = valid.map((s: any, i: number) => `${i+1}: ${s.reps}×${s.weight||'—'}${ls.weightUnit||'kg'}`).join('  ·  ');
                          return <div style={{ fontSize: "0.68rem", color: "#3a3a3a", fontFamily: "'DM Sans'", marginBottom: 10, letterSpacing: 0.3 }}>LAST&nbsp;&nbsp;<span style={{ color: "#555" }}>{summary}</span></div>;
                        })()}
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 24, flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>REPS</div>
                          <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>WEIGHT ({weightUnit})</div>
                        </div>
                        {(block.sets || []).map((s: any, si: number) => (
                          <div key={si} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                            <div style={{ width: 24, fontSize: "0.7rem", color: "#444", fontFamily: "'DM Sans'", textAlign: "center", flexShrink: 0 }}>{si + 1}</div>
                            <input className="input-field" type="tel" placeholder="—" value={s.reps} onChange={(e) => updateSet(block.id, si, "reps", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                            <input className="input-field" type="tel" placeholder="—" value={s.weight} onChange={(e) => updateSet(block.id, si, "weight", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Hyrox / Cardio: sets */
                      <div>
                        {/* Unit (block-level) + Sets stepper */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          {isWallBalls ? <div /> : (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>UNIT</span>
                              <select className="select-field" value={block.unit} onChange={(e) => updateBlock(block.id, "unit", e.target.value)} style={{ width: 74, padding: "5px 8px" }}>
                                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "0.65rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>SETS</span>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <button onClick={() => updateBlock(block.id, "hyroxNumSets", (block.hyroxNumSets || 1) - 1)} style={{ width: 30, height: 30, background: "#161616", border: "1px solid #252525", color: "#aaa", borderRadius: "5px 0 0 5px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                              <div style={{ width: 38, height: 30, background: catColor + "22", border: `1px solid ${catColor}`, borderLeft: "none", borderRight: "none", color: catColor, fontFamily: "'DM Sans'", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{block.hyroxNumSets || 1}</div>
                              <button onClick={() => updateBlock(block.id, "hyroxNumSets", (block.hyroxNumSets || 1) + 1)} style={{ width: 30, height: 30, background: "#161616", border: "1px solid #252525", color: "#aaa", borderRadius: "0 5px 5px 0", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                            </div>
                          </div>
                        </div>

                        {/* Last session reference — hyrox */}
                        {block.movementId && lastSessions[block.movementId] && (() => {
                          const ls = lastSessions[block.movementId];
                          const lsSets = ls.hyroxSets?.filter((s: any) => s.dist || s.reps || s.time);
                          let summary = "";
                          if (lsSets?.length) {
                            summary = lsSets.map((s: any, i: number) => {
                              if (ls.exercise_id === WALL_BALLS_ID || ls.exerciseId === WALL_BALLS_ID) return `${i+1}: ${s.reps||'—'}r × ${s.weight||'—'}kg`;
                              if (HYROX_WEIGHTED.includes(ls.exercise_id || ls.exerciseId)) return `${i+1}: ${s.dist||'—'}${ls.unit||'m'} @ ${s.weight||'—'}kg`;
                              return `${i+1}: ${s.dist||'—'}${ls.unit||'m'}${s.time > 0 ? ` in ${formatTime(s.time)}` : ''}`;
                            }).join('  ·  ');
                          } else if (ls.distance) {
                            summary = `${ls.distance}${ls.unit || 'm'}${ls.time > 0 ? ` in ${formatTime(ls.time)}` : ''}`;
                          }
                          if (!summary) return null;
                          return <div style={{ fontSize: "0.68rem", color: "#3a3a3a", fontFamily: "'DM Sans'", marginBottom: 10, letterSpacing: 0.3 }}>LAST&nbsp;&nbsp;<span style={{ color: "#555" }}>{summary}</span></div>;
                        })()}

                        {/* Column headers */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 24, flexShrink: 0 }} />
                          {isWallBalls ? (
                            <>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>REPS</div>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>WEIGHT (kg)</div>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>TIME</div>
                            </>
                          ) : isWeightedHyrox ? (
                            <>
                              <div style={{ flex: 1.5, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>DIST</div>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>WEIGHT (kg)</div>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>TIME</div>
                            </>
                          ) : (
                            <>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>DIST</div>
                              <div style={{ flex: 1, fontSize: "0.6rem", color: "#444", letterSpacing: 2, fontFamily: "'DM Sans'", textAlign: "center" }}>TIME</div>
                            </>
                          )}
                        </div>

                        {/* Set rows */}
                        {(block.hyroxSets || []).map((s: any, si: number) => (
                          <div key={si} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                            <div style={{ width: 24, fontSize: "0.7rem", color: "#444", fontFamily: "'DM Sans'", textAlign: "center", flexShrink: 0 }}>{si + 1}</div>
                            {isWallBalls ? (
                              <>
                                <input className="input-field" type="tel" placeholder="—" value={s.reps} onChange={(e) => updateHyroxSet(block.id, si, "reps", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                                <input className="input-field" type="tel" placeholder="—" value={s.weight} onChange={(e) => updateHyroxSet(block.id, si, "weight", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                                <input className="input-field" type="tel" placeholder="—" value={s.timeInput} onChange={(e) => updateHyroxSet(block.id, si, "timeInput", e.target.value)} onBlur={(e) => { const raw = e.target.value.replace(/[^0-9]/g,""); if(raw.length>=3){updateHyroxSet(block.id,si,"timeInput",raw.slice(0,-2)+":"+raw.slice(-2));} }} style={{ flex: 1, textAlign: "center" }} />
                              </>
                            ) : isWeightedHyrox ? (
                              <>
                                <input className="input-field" type="tel" placeholder="—" value={s.dist} onChange={(e) => updateHyroxSet(block.id, si, "dist", e.target.value)} style={{ flex: 1.5, textAlign: "center" }} />
                                <input className="input-field" type="tel" placeholder="—" value={s.weight} onChange={(e) => updateHyroxSet(block.id, si, "weight", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                                <input className="input-field" type="tel" placeholder="—" value={s.timeInput} onChange={(e) => updateHyroxSet(block.id, si, "timeInput", e.target.value)} onBlur={(e) => { const raw = e.target.value.replace(/[^0-9]/g,""); if(raw.length>=3){updateHyroxSet(block.id,si,"timeInput",raw.slice(0,-2)+":"+raw.slice(-2));} }} style={{ flex: 1, textAlign: "center" }} />
                              </>
                            ) : (
                              <>
                                <input className="input-field" type="tel" placeholder="—" value={s.dist} onChange={(e) => updateHyroxSet(block.id, si, "dist", e.target.value)} style={{ flex: 1, textAlign: "center" }} />
                                <input className="input-field" type="tel" placeholder="—" value={s.timeInput} onChange={(e) => updateHyroxSet(block.id, si, "timeInput", e.target.value)} onBlur={(e) => { const raw = e.target.value.replace(/[^0-9]/g,""); if(raw.length>=3){updateHyroxSet(block.id,si,"timeInput",raw.slice(0,-2)+":"+raw.slice(-2));} }} style={{ flex: 1, textAlign: "center" }} />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ marginTop: isStrength ? 10 : 0 }}>
                      <input className="input-field" placeholder="Notes — e.g. felt strong, 20kg sled, HR 165..." value={block.notes} onChange={(e) => updateBlock(block.id, "notes", e.target.value)} style={{ fontSize: "0.82rem", color: "#888" }} />
                    </div>

                    {/* Live preview for hyrox/cardio */}
                    {!isStrength && (() => {
                      const hs = block.hyroxSets || [];
                      const totalT = hs.reduce((s: number, x: any) => s + (x.time || 0), 0);
                      const totalD = hs.reduce((s: number, x: any) => s + (parseFloat(x.dist) || 0), 0);
                      const totalR = hs.reduce((s: number, x: any) => s + (parseInt(x.reps) || 0), 0);
                      if (totalT === 0 && totalD === 0 && totalR === 0) return null;
                      return (
                        <div style={{ marginTop: 10, padding: "7px 11px", background: "#141414", borderRadius: 5, fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#777", display: "flex", gap: 18, flexWrap: "wrap" }}>
                          {isWallBalls ? (
                            totalR > 0 && <span><strong style={{ color: "#ccc" }}>{totalR} reps</strong></span>
                          ) : (
                            totalD > 0 && <span><strong style={{ color: "#ccc" }}>{Number.isInteger(totalD) ? totalD : totalD.toFixed(1)}{block.unit}</strong></span>
                          )}
                          {totalT > 0 && <span>⏱ <strong style={{ color: "#ff7b00" }}>{formatTime(totalT)}</strong></span>}
                          {totalD > 0 && totalT > 0 && block.unit === "m" && !isWallBalls && (
                            <span>📈 <strong style={{ color: "#aaa" }}>{Math.round((totalT / totalD) * 1000)}s/km</strong></span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            <button className="btn-ghost" onClick={() => addBlock()} style={{ width: "100%", marginBottom: 16, padding: "13px", fontSize: "0.95rem" }}>+ ADD BLOCK</button>

            {blocks.some((b) => b.time > 0 || b.distance || (b.sets && b.sets.some((s: any) => s.reps)) || (b.hyroxSets && b.hyroxSets.some((s: any) => s.dist || s.reps || s.timeInput))) && (
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

            <button className="btn-primary" onClick={saveWorkout} style={{ width: "100%", padding: "14px", fontSize: "1.1rem" }}>SAVE WORKOUT</button>
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
                  {viewingWorkout.blocks.map((rawB: any, i: number) => {
                    const b = parseBlock(rawB);
                    const catColor = CATEGORY_META[b.category]?.color || "#ff3c00";
                    const moveName = b.exercise_id === "custom" ? (b.customMovement || "Custom") : getMovementName(b.category, b.exercise_id);
                    const icon = getMovementIcon(b.category, b.exercise_id);
                    const isStrength = isStrengthCat(b.category);
                    return (
                      <div key={b.id || i} style={{ display: "flex", gap: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: catColor + "15", border: `2px solid ${catColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                            {icon || CATEGORY_META[b.category]?.label?.[0] || "•"}
                          </div>
                          {i < viewingWorkout.blocks.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 20, background: "#1a1a1a" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingLeft: 14, paddingBottom: i < viewingWorkout.blocks.length - 1 ? 20 : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: "0.6rem", color: catColor, letterSpacing: 2, fontFamily: "'DM Sans'" }}>{(CATEGORY_META[b.category]?.label || "HYROX")}</div>
                              <div style={{ fontFamily: "'DM Sans'", fontSize: "1rem", fontWeight: 600, marginTop: 1, color: "#ddd" }}>{moveName}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              {isStrength && b.sets ? (
                                <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#888" }}>
                                  {b.sets.filter((s: any) => s.reps).map((s: any, si: number) => (
                                    <div key={si}>{s.reps} reps{s.weight ? ` × ${s.weight}${b.weightUnit}` : ""}</div>
                                  ))}
                                </div>
                              ) : b.hyroxSets?.filter((s: any) => s.dist || s.reps || s.time).length ? (
                                <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#888" }}>
                                  {b.hyroxSets.filter((s: any) => s.dist || s.reps || s.time).map((s: any, si: number) => {
                                    const eid = b.exercise_id || b.exerciseId;
                                    if (eid === WALL_BALLS_ID) return <div key={si}>{s.reps||'—'} reps{s.weight ? ` × ${s.weight}kg` : ''}{s.time > 0 ? ` — ${formatTime(s.time)}` : ''}</div>;
                                    if (HYROX_WEIGHTED.includes(eid)) return <div key={si}>{s.dist||'—'}{b.unit}{s.weight ? ` @ ${s.weight}kg` : ''}{s.time > 0 ? ` — ${formatTime(s.time)}` : ''}</div>;
                                    return <div key={si}>{s.dist||'—'}{b.unit}{s.time > 0 ? ` in ${formatTime(s.time)}` : ''}</div>;
                                  })}
                                </div>
                              ) : (
                                <>
                                  {b.distance && b.unit !== "sets" && <div style={{ fontFamily: "'DM Sans'", fontSize: "1rem", fontWeight: 700, color: catColor }}>{b.distance}{b.unit}</div>}
                                  {b.time > 0 && <div style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#888", marginTop: 1 }}>⏱ {formatTime(b.time)}</div>}
                                  {b.distance && b.time > 0 && b.unit === "m" && parseFloat(b.distance) > 0 && (
                                    <div style={{ fontFamily: "'DM Sans'", fontSize: "0.75rem", color: "#555", marginTop: 1 }}>{Math.round((b.time / parseFloat(b.distance)) * 1000)}s/km</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {b.parsedNotes && (
                            <div style={{ fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#555", fontStyle: "italic", marginTop: 4 }}>{b.parsedNotes}</div>
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
                            <div style={{ fontSize: "0.68rem", color: "#444", fontFamily: "'DM Sans'", marginTop: 2 }}>{pr.date}</div>
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


      {/* ──────────── TRAINING PLAN ──────────── */}
      {tab === "plan" && (
        <div className="fade-up">
          {!activePlan ? (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>YOUR PROGRAM</div>
                <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>TRAINING PLAN</div>
                <div style={{ fontSize: "0.82rem", color: "#555", fontFamily: "'DM Sans'", marginTop: 6 }}>Answer a few questions and get a personalized Hyrox training plan.</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: 2, marginBottom: 7, fontFamily: "'DM Sans'" }}>RACE DATE (optional)</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="date" className="input-field" value={planForm.raceDate} onChange={(e) => setPlanForm(f => ({ ...f, raceDate: e.target.value }))} style={{ flex: 1, minWidth: 0 }} />
                    {planForm.raceDate && (
                      <button onClick={() => setPlanForm(f => ({ ...f, raceDate: "" }))} style={{ background: "#161616", border: "1px solid #252525", color: "#888", padding: "9px 12px", borderRadius: 5, cursor: "pointer", fontFamily: "'DM Sans'", fontSize: "0.85rem", flexShrink: 0 }}>CLEAR</button>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Sans'" }}>FITNESS LEVEL</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["beginner", "intermediate", "competitive"].map(lv => (
                      <button key={lv} onClick={() => setPlanForm(f => ({ ...f, fitnessLevel: lv }))} style={{ flex: 1, padding: "10px 4px", background: planForm.fitnessLevel === lv ? "#ff3c00" : "#161616", border: `1px solid ${planForm.fitnessLevel === lv ? "#ff3c00" : "#252525"}`, color: planForm.fitnessLevel === lv ? "#fff" : "#666", borderRadius: 5, cursor: "pointer", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", letterSpacing: 1, transition: "all 0.15s", textTransform: "capitalize" as const }}>{lv}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Sans'" }}>DAYS PER WEEK</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[3, 4, 5, 6].map(d => (
                      <button key={d} onClick={() => setPlanForm(f => ({ ...f, daysPerWeek: d }))} style={{ flex: 1, padding: "10px 4px", background: planForm.daysPerWeek === d ? "#ff3c00" : "#161616", border: `1px solid ${planForm.daysPerWeek === d ? "#ff3c00" : "#252525"}`, color: planForm.daysPerWeek === d ? "#fff" : "#666", borderRadius: 5, cursor: "pointer", fontFamily: "'Bebas Neue'", fontSize: "1.1rem", letterSpacing: 1, transition: "all 0.15s" }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#111", border: "1px solid #1c1c1c", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: "0.9rem", color: "#ddd" }}>Gym Access</div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: "0.72rem", color: "#555", marginTop: 2 }}>Sled, SkiErg, rower available</div>
                  </div>
                  <button onClick={() => setPlanForm(f => ({ ...f, hasGym: !f.hasGym }))} style={{ width: 48, height: 26, background: planForm.hasGym ? "#ff3c00" : "#252525", borderRadius: 13, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: planForm.hasGym ? 25 : 3, width: 20, height: 20, background: "#fff", borderRadius: 10, transition: "left 0.2s" }} />
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Sans'" }}>DIVISION</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["open", "Open", "Standard weights"], ["pro", "Pro", "Heavier weights"]].map(([val, label, sub]) => (
                      <button key={val} onClick={() => setPlanForm(f => ({ ...f, division: val }))} style={{ flex: 1, padding: "12px 8px", background: planForm.division === val ? "#ff3c00" : "#161616", border: `1px solid ${planForm.division === val ? "#ff3c00" : "#252525"}`, color: planForm.division === val ? "#fff" : "#666", borderRadius: 5, cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1rem", letterSpacing: 2 }}>{label}</div>
                        <div style={{ fontFamily: "'DM Sans'", fontSize: "0.68rem", opacity: 0.7, marginTop: 2 }}>{sub}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, padding: "10px 12px", background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 6 }}>
                    {(() => {
                      const gender = user?.user_metadata?.gender || "man";
                      const rw = RACE_WEIGHTS[`${planForm.division}_${gender}`] || RACE_WEIGHTS["open_man"];
                      return <div style={{ fontFamily: "'DM Sans'", fontSize: "0.72rem", color: "#555", lineHeight: 1.7 }}>
                        Race weights for your division — Sled Push <span style={{ color: "#888" }}>{rw.sledPush}</span> · Sled Pull <span style={{ color: "#888" }}>{rw.sledPull}</span> · Carries <span style={{ color: "#888" }}>{rw.farmersCarry}</span> · Sandbag <span style={{ color: "#888" }}>{rw.sandbagLunges}</span> · Wall Balls <span style={{ color: "#888" }}>{rw.wallBalls}</span>
                      </div>;
                    })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#888", letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Sans'" }}>WEAK AREAS TO FOCUS ON (optional)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {FOCUS_AREAS.map(area => {
                      const sel = planForm.focusAreas.includes(area.id);
                      return (
                        <button key={area.id} onClick={() => setPlanForm(f => ({ ...f, focusAreas: sel ? f.focusAreas.filter(a => a !== area.id) : [...f.focusAreas, area.id] }))} className="ex-pill" style={{ borderColor: sel ? "#ff3c00" : undefined, color: sel ? "#ff3c00" : undefined }}>{area.label}</button>
                      );
                    })}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={generatingPlan} onClick={async () => { const plan = generatePlan(planForm); await savePlan(plan); }}>
                  {generatingPlan ? "GENERATING..." : "GENERATE PLAN"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#555", letterSpacing: 3, fontFamily: "'DM Sans'", marginBottom: 3 }}>YOUR PROGRAM</div>
                  <div style={{ fontSize: "2.4rem", letterSpacing: 3 }}>TRAINING PLAN</div>
                </div>
                <button className="btn-ghost" style={{ fontSize: "0.75rem", marginTop: 6 }} onClick={() => { setActivePlan(null); }}>REBUILD</button>
              </div>
              <div className="card" style={{ marginBottom: 18, display: "flex", gap: 0 }}>
                {[
                  { val: activePlan.weeks_data?.length || 0, label: "WEEKS" },
                  { val: activePlan.days_per_week, label: "DAYS/WK" },
                  { val: (activePlan.fitness_level || "").slice(0, 4).toUpperCase(), label: "LEVEL" },
                  ...(activePlan.race_date ? [{ val: new Date(activePlan.race_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), label: "RACE" }] : []),
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid #1c1c1c" : "none", padding: "4px 0" }}>
                    <div style={{ fontSize: "1.6rem", color: "#ff3c00", fontFamily: "'Bebas Neue'", letterSpacing: 2 }}>{s.val}</div>
                    <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: 2, fontFamily: "'DM Sans'" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(activePlan.weeks_data || []).map((week: any, wi: number) => {
                  const phaseColor: Record<string, string> = { base: "#3b9eff", build: "#ff9900", peak: "#ff3c00", taper: "#44cc88" };
                  const pc = phaseColor[week.phase] || "#888";
                  const isWkOpen = expandedWeek === wi;
                  return (
                    <div key={wi} style={{ border: "1px solid #1c1c1c", borderRadius: 8, overflow: "hidden" }}>
                      <button onClick={() => setExpandedWeek(isWkOpen ? null : wi)} style={{ width: "100%", background: "#111", border: "none", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.05rem", letterSpacing: 2 }}>WEEK {week.weekNumber}</div>
                          <div style={{ fontSize: "0.62rem", background: pc + "22", color: pc, border: `1px solid ${pc}44`, borderRadius: 10, padding: "2px 8px", fontFamily: "'DM Sans'", letterSpacing: 1, textTransform: "uppercase" as const }}>{week.phase}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: "0.72rem", color: "#555", fontFamily: "'DM Sans'" }}>{week.sessions?.length} days</div>
                          <div style={{ color: "#444", fontSize: "0.75rem" }}>{isWkOpen ? "▲" : "▼"}</div>
                        </div>
                      </button>
                      {isWkOpen && (
                        <div style={{ background: "#0a0a0a", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                          {(week.sessions || []).map((session: any, si: number) => {
                            const sk = `${wi}-${si}`;
                            const isDayOpen = expandedDay === sk;
                            const tc: Record<string, string> = { strength: "#ff9900", station: "#ff3c00", run: "#3b9eff", race_sim: "#ff3c00", rest: "#444" };
                            const ti: Record<string, string> = { strength: "💪", station: "⚡", run: "🏃", race_sim: "🏁", rest: "😴" };
                            const sc = tc[session.type] || "#888";
                            const isDone = completedSessions.has(sk);
                            return (
                              <div key={si} style={{ background: isDone ? "#0a1a0a" : "#111", border: `1px solid ${isDone ? "#1a3a1a" : "#1a1a1a"}`, borderRadius: 6, overflow: "hidden", transition: "all 0.2s" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <button onClick={() => setExpandedDay(isDayOpen ? null : sk)} style={{ flex: 1, background: "none", border: "none", padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "#fff" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                      <div style={{ fontSize: "1.05rem", opacity: isDone ? 0.4 : 1 }}>{ti[session.type] || "•"}</div>
                                      <div style={{ textAlign: "left" }}>
                                        <div style={{ fontFamily: "'DM Sans'", fontSize: "0.86rem", color: isDone ? "#555" : "#e0e0e0", textDecoration: isDone ? "line-through" : "none" }}>Day {session.dayNumber} — {session.name}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#555", fontFamily: "'DM Sans'", marginTop: 1 }}>{session.duration} min · <span style={{ color: isDone ? "#444" : sc }}>{session.type.replace("_", " ").toUpperCase()}</span></div>
                                      </div>
                                    </div>
                                    <div style={{ color: "#444", fontSize: "0.72rem", marginRight: 4 }}>{isDayOpen ? "▲" : "▼"}</div>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); toggleSessionComplete(wi, si); }} style={{ background: isDone ? "#1a4a1a" : "#161616", border: `1px solid ${isDone ? "#2a6a2a" : "#252525"}`, color: isDone ? "#44cc88" : "#444", width: 36, height: 36, borderRadius: 5, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "0 10px", transition: "all 0.2s" }}>
                                    ✓
                                  </button>
                                </div>
                                {isDayOpen && (
                                  <div style={{ padding: "4px 13px 13px", borderTop: "1px solid #1a1a1a" }}>
                                    {session.description && <div style={{ fontSize: "0.78rem", color: "#555", fontFamily: "'DM Sans'", marginBottom: 10, lineHeight: 1.55, fontStyle: "italic" }}>{session.description}</div>}
                                    {(session.exercises || []).map((ex: any, ei: number) => (
                                      <div key={ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: ei < session.exercises.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                                        <div style={{ fontFamily: "'DM Sans'", fontSize: "0.84rem", color: "#ccc", flex: 1 }}>
                                          {ex.name}
                                          {ex.notes && <div style={{ fontSize: "0.7rem", color: "#555", marginTop: 2 }}>{ex.notes}</div>}
                                        </div>
                                        <div style={{ textAlign: "right", fontFamily: "'DM Sans'", fontSize: "0.78rem", color: "#888", marginLeft: 10, flexShrink: 0 }}>
                                          {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets && ex.distance ? `${ex.sets}×${ex.distance}` : ex.reps || ex.distance || ""}
                                          {ex.weight && <div style={{ fontSize: "0.68rem", color: "#444", marginTop: 2 }}>{ex.weight}</div>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        {([
          ["dashboard", "🏠", "Home"],
          ["log", "➕", "Log"],
          ["plan", "📅", "Plan"],
          ["history", "📋", "History"],
          ["coach", "💬", "Coach"],
        ] as [string, string, string][]).map(([t, icon, label]) => (
          <button
            key={t}
            className={`bottom-nav-btn ${tab === t ? "active" : ""}`}
            onClick={() => {
              setTab(t);
              if (t !== "history") setViewingWorkout(null);
              if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            }}
          >
            <span className="bottom-nav-icon">{icon}</span>
            <span className="bottom-nav-label">{label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
