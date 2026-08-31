const STORAGE_KEY = "daily-adhd-os-v1";

const DEFAULT_DOPAMINE = [
  { id: "d1", mins: "2 min", title: "Stand up and stretch", note: "Tiny reset" },
  { id: "d2", mins: "2 min", title: "Drink a glass of water", note: "Body" },
  { id: "d3", mins: "5 min", title: "Put on a song you like", note: "Dopamine" },
  { id: "d4", mins: "5 min", title: "Step outside", note: "Air" },
  { id: "d5", mins: "10 min", title: "Tidy one surface", note: "Visible win" },
  { id: "d6", mins: "10 min", title: "Text someone kind", note: "Social" },
  { id: "d7", mins: "treat", title: "Fancy tea or a snack", note: "Permission" },
  { id: "d8", mins: "treat", title: "Five minutes of a comfort show", note: "After a task" }
];

const DEFAULT_HABITS = [
  { id: "h1", name: "Meds / vitamins" },
  { id: "h2", name: "Something that feeds you" },
  { id: "h3", name: "Touched daylight" }
];

const LOW_RESETS = [
  { id: "r1", name: "Water" },
  { id: "r2", name: "Eat something" },
  { id: "r3", name: "Meds if you take them" },
  { id: "r4", name: "Sit down for two minutes" }
];

const NAV = [
  { id: "today", label: "Today" },
  { id: "dump", label: "Dump" },
  { id: "focus", label: "Focus" },
  { id: "habits", label: "Habits" },
  { id: "dopamine", label: "Dopamine" },
  { id: "settings", label: "Settings" }
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayISO(dt);
}

function formatPretty(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function weekdayShort(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "narrow" });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function freshState() {
  return {
    onboarded: false,
    name: "",
    theme: "ink",
    route: "today",
    energyByDay: {},
    tasksByDay: {},
    leftoversOffered: {},
    dump: [],
    dopamine: DEFAULT_DOPAMINE.map((x) => ({ ...x })),
    habits: DEFAULT_HABITS.map((h) => ({ ...h, logs: {} })),
    lowResets: {},
    noteByDay: {},
    enoughByDay: {},
    focusMinutes: 15
  };
}

const state = loadState() || freshState();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureToday() {
  const t = todayISO();
  if (!state.tasksByDay[t]) state.tasksByDay[t] = [];
  if (!state.energyByDay[t]) state.energyByDay[t] = "medium";
}

function yesterdayISO() {
  return addDays(todayISO(), -1);
}

function incompleteYesterday() {
  const y = yesterdayISO();
  return (state.tasksByDay[y] || []).filter((task) => !task.done && task.text.trim());
}

const timer = {
  remaining: 15 * 60,
  running: false,
  handle: null,
  total: 15 * 60
};

function setTimerMinutes(mins) {
  state.focusMinutes = mins;
  timer.total = mins * 60;
  timer.remaining = mins * 60;
  timer.running = false;
  clearInterval(timer.handle);
  save();
  render();
}

function tickTimer() {
  if (!timer.running) return;
  timer.remaining -= 1;
  if (timer.remaining <= 0) {
    timer.remaining = 0;
    timer.running = false;
    clearInterval(timer.handle);
    chime();
    render();
    return;
  }
  const face = document.querySelector("[data-time-face]");
  const ring = document.querySelector("[data-ring]");
  if (face) face.textContent = formatTime(timer.remaining);
  if (ring) {
    const c = 2 * Math.PI * 80;
    ring.style.strokeDashoffset = String(c * (1 - timer.remaining / timer.total));
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + i * 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + 0.8 + i * 0.12);
    });
  } catch {}
}

function icon(name) {
  const paths = {
    today: "M7 3h10a2 2 0 0 1 2 2v14H5V5a2 2 0 0 1 2-2zm0 4h10M8 14h3",
    dump: "M5 7h14M7 7l1 12h8l1-12M9 7V5h6v2",
    focus: "M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    habits: "M5 12l4 4 10-10",
    dopamine: "M12 3l2.2 6.4H21l-5.3 3.9 2 6.2L12 16.4 6.3 19.5l2-6.2L3 9.4h6.8z",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L14.8 3h-5.6l-.4 2.5a7.6 7.6 0 0 0-1.7 1L4.7 6l-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7 1l.4 2.5h5.6l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z"
  };
  return `<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
}

function greet() {
  const hour = new Date().getHours();
  const name = state.name ? `, ${state.name}` : "";
  if (hour < 12) return `Good morning${name}`;
  if (hour < 17) return `Good afternoon${name}`;
  return `Good evening${name}`;
}

function showname() {
  return state.name ? state.name : "friend";
}
