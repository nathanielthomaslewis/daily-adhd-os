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
