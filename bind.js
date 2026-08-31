function bindOnboard() {
  document.querySelectorAll("[data-energy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.energyByDay[todayISO()] = btn.dataset.energy;
      save();
      render();
    });
  });
  document.getElementById("start").addEventListener("click", () => {
    state.name = document.getElementById("name").value.trim();
    state.onboarded = true;
    state.route = "today";
    save();
    render();
  });
}

function go(route) {
  state.route = route;
  save();
  render();
}

function bindApp() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.nav));
  });
  document.querySelectorAll("[data-energy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.energyByDay[todayISO()] = btn.dataset.energy;
      save();
      render();
    });
  });

  const addTask = document.getElementById("add-task");
  const newTask = document.getElementById("new-task");
  if (addTask && newTask) {
    const add = () => {
      const text = newTask.value.trim();
      if (!text) return;
      const t = todayISO();
      if ((state.tasksByDay[t] || []).length >= 3) return;
      state.tasksByDay[t].push({ id: uid(), text, done: false });
      save();
      render();
    };
    addTask.addEventListener("click", add);
    newTask.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); add(); }
    });
  }

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = todayISO();
      const task = (state.tasksByDay[t] || []).find((x) => x.id === btn.dataset.toggle);
      if (task) {
        task.done = !task.done;
        if (task.done && (state.tasksByDay[t] || []).every((x) => x.done)) {
          state.enoughByDay[t] = true;
        }
        save();
        render();
      }
    });
  });
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = todayISO();
      state.tasksByDay[t] = (state.tasksByDay[t] || []).filter((x) => x.id !== btn.dataset.delete);
      save();
      render();
    });
  });
  document.querySelectorAll("[data-edit]").forEach((area) => {
    const resize = () => {
      area.style.height = "auto";
      area.style.height = area.scrollHeight + "px";
    };
    resize();
    area.addEventListener("input", () => {
      resize();
      const t = todayISO();
      const task = (state.tasksByDay[t] || []).find((x) => x.id === area.dataset.edit);
      if (task) { task.text = area.value; save(); }
    });
  });

  const quick = document.getElementById("quick-dump");
  const addDump = document.getElementById("add-dump");
  if (quick && addDump) {
    const park = () => {
      const text = quick.value.trim();
      if (!text) return;
      state.dump.unshift({ id: uid(), text, status: "inbox", created: todayISO() });
      save();
      render();
    };
    addDump.addEventListener("click", park);
    quick.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); park(); }
    });
  }

  const note = document.getElementById("day-note");
  if (note) {
    note.addEventListener("input", () => {
      state.noteByDay[todayISO()] = note.value;
      save();
    });
  }

  document.querySelectorAll("[data-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = todayISO();
      state.lowResets[t] = state.lowResets[t] || {};
      state.lowResets[t][btn.dataset.reset] = !state.lowResets[t][btn.dataset.reset];
      save();
      render();
    });
  });

  const leftoversAction = (mode) => {
    const t = todayISO();
    const items = incompleteYesterday();
    if (mode === "bring") {
      items.forEach((item) => {
        if ((state.tasksByDay[t] || []).length < 3) {
          state.tasksByDay[t].push({ id: uid(), text: item.text, done: false });
        } else {
          state.dump.unshift({ id: uid(), text: item.text, status: "inbox", created: t });
        }
      });
    } else if (mode === "park") {
      items.forEach((item) => {
        state.dump.unshift({ id: uid(), text: item.text, status: "later", created: t });
      });
    }
    state.leftoversOffered[t] = true;
    save();
    render();
  };
  document.getElementById("bring-leftovers")?.addEventListener("click", () => leftoversAction("bring"));
  document.getElementById("park-leftovers")?.addEventListener("click", () => leftoversAction("park"));
  document.getElementById("drop-leftovers")?.addEventListener("click", () => leftoversAction("drop"));

  const dumpInput = document.getElementById("dump-input");
  document.getElementById("dump-add")?.addEventListener("click", () => {
    const text = dumpInput.value.trim();
    if (!text) return;
    state.dump.unshift({ id: uid(), text, status: "inbox", created: todayISO() });
    save();
    render();
  });
  dumpInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("dump-add").click();
    }
  });
  document.querySelectorAll("[data-promote]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.dump.find((d) => d.id === btn.dataset.promote);
      const t = todayISO();
      if (!item) return;
      if ((state.tasksByDay[t] || []).length < 3) {
        state.tasksByDay[t].push({ id: uid(), text: item.text, done: false });
        state.dump = state.dump.filter((d) => d.id !== item.id);
      } else {
        item.status = "later";
      }
      save();
      render();
    });
  });
  document.querySelectorAll("[data-later]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.dump.find((d) => d.id === btn.dataset.later);
      if (item) item.status = "later";
      save();
      render();
    });
  });
  document.querySelectorAll("[data-inbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.dump.find((d) => d.id === btn.dataset.inbox);
      if (item) item.status = "inbox";
      save();
      render();
    });
  });
  document.querySelectorAll("[data-dump-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.dump = state.dump.filter((d) => d.id !== btn.dataset.dumpDel);
      save();
      render();
    });
  });

  document.querySelectorAll("[data-mins]").forEach((btn) => {
    btn.addEventListener("click", () => setTimerMinutes(Number(btn.dataset.mins)));
  });
  document.getElementById("timer-toggle")?.addEventListener("click", () => {
    if (timer.remaining === 0) {
      setTimerMinutes(state.focusMinutes);
      return;
    }
    timer.running = !timer.running;
    clearInterval(timer.handle);
    if (timer.running) timer.handle = setInterval(tickTimer, 1000);
    render();
  });
  document.getElementById("timer-reset")?.addEventListener("click", () => setTimerMinutes(state.focusMinutes));

  document.querySelectorAll("[data-habit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const habit = state.habits.find((h) => h.id === btn.dataset.habit);
      if (!habit) return;
      const day = btn.dataset.day;
      habit.logs[day] = !habit.logs[day];
      save();
      render();
    });
  });
  document.getElementById("add-habit")?.addEventListener("click", () => {
    const input = document.getElementById("new-habit");
    const name = input.value.trim();
    if (!name) return;
    state.habits.push({ id: uid(), name, logs: {} });
    save();
    render();
  });

  document.getElementById("add-dop")?.addEventListener("click", () => {
    const title = document.getElementById("dop-title").value.trim();
    const mins = document.getElementById("dop-mins").value.trim() || "5 min";
    if (!title) return;
    state.dopamine.unshift({ id: uid(), title, mins, note: "Yours" });
    save();
    render();
  });
  document.querySelectorAll("[data-dop]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.style.outline = "2px solid var(--accent)";
      setTimeout(() => { btn.style.outline = ""; }, 700);
    });
  });

  document.getElementById("set-name")?.addEventListener("input", (e) => {
    state.name = e.target.value;
    save();
  });
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.theme = btn.dataset.theme;
      save();
      render();
    });
  });
  document.getElementById("export")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `daily-adhd-os-${todayISO()}.json`;
    a.click();
  });
  document.getElementById("import")?.addEventListener("click", () => {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        Object.assign(state, data);
        save();
        render();
      } catch {
        alert("Couldn't read that file.");
      }
    };
    reader.readAsText(file);
  });
  document.getElementById("reset")?.addEventListener("click", () => {
    if (!confirm("This clears everything on this device. Sure?")) return;
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, freshState());
    render();
  });
}

render();
