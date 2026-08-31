function render() {
  ensureToday();
  if (!state.theme || state.theme === "ink") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = state.theme;

  const root = document.getElementById("app");
  if (!state.onboarded) {
    root.innerHTML = renderOnboard();
    bindOnboard();
    return;
  }
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="mark" aria-hidden="true"></div>
          <div class="brand-name">Daily ADHD OS<span>for a loud brain</span></div>
        </div>
        ${NAV.map((n) => `
          <button class="nav-btn ${state.route === n.id ? "active" : ""}" data-nav="${n.id}">
            ${icon(n.id)} ${n.label}
          </button>
        `).join("")}
        <div class="sidebar-foot">Local-only. Nothing leaves this browser.</div>
      </aside>
      <div>
        <main class="main">${renderRoute()}</main>
        <nav class="mobile-nav">
          ${NAV.map((n) => `
            <button class="${state.route === n.id ? "active" : ""}" data-nav="${n.id}">
              ${icon(n.id)} ${n.label}
            </button>
          `).join("")}
        </nav>
      </div>
    </div>
  `;
  bindApp();
}

function renderOnboard() {
  return `
    <div class="onboard">
      <div class="onboard-card">
        <div class="steps">Step 1 of 2</div>
        <h1>A calmer OS for a loud brain.</h1>
        <p class="hint">Three things counts as a full day. Low energy is a mode, not a failure.</p>
        <label class="hint" for="name">What should we call you?</label>
        <input id="name" class="input" placeholder="First name, nickname, or skip" value="${escapeHtml(state.name)}" />
        <div style="height:16px"></div>
        <p class="hint">How's your energy right now?</p>
        <div class="energy-pills" style="margin-bottom:22px">
          ${energyButtons()}
        </div>
        <button class="btn full" id="start">Open Today</button>
      </div>
    </div>
  `;
}

function energyButtons() {
  const t = todayISO();
  const cur = state.energyByDay[t] || "medium";
  return [
    ["low", "Low"],
    ["medium", "Medium"],
    ["high", "High"]
  ].map(([id, label]) => `
    <button class="pill ${id} ${cur === id ? "on" : ""}" data-energy="${id}">${label}</button>
  `).join("");
}

function weekStrip() {
  const t = todayISO();
  const start = addDays(t, -3);
  return `
    <div class="week-strip">
      ${[0,1,2,3,4,5,6].map((i) => {
        const iso = addDays(start, i);
        const [,, d] = iso.split("-");
        const done = (state.tasksByDay[iso] || []).filter((x) => x.done).length;
        return `<div class="week-day ${iso === t ? "today" : ""}">${weekdayShort(iso)}<b>${Number(d)}</b>${done ? "·" : ""}</div>`;
      }).join("")}
    </div>
  `;
}

function renderRoute() {
  switch (state.route) {
    case "dump": return renderDump();
    case "focus": return renderFocus();
    case "habits": return renderHabits();
    case "dopamine": return renderDopamine();
    case "settings": return renderSettings();
    default: return renderToday();
  }
}

function renderToday() {
  const t = todayISO();
  const energy = state.energyByDay[t] || "medium";
  if (energy === "low") return renderLow();
  const tasks = state.tasksByDay[t];
  const cap = 3;
  const done = tasks.filter((x) => x.done).length;
  const leftovers = incompleteYesterday();
  const showLeftovers = leftovers.length && !state.leftoversOffered[t];
  return `
    <div class="topbar">
      <div>
        <p class="kicker">${formatPretty(t)}</p>
        <h1 class="page-title">${greet()}</h1>
        <p class="page-sub">${energy === "high" ? "Plenty in the tank. Still cap it at three." : "Three things. That's a full day."}</p>
      </div>
      <div class="energy-pills">${energyButtons()}</div>
    </div>
    ${weekStrip()}
    <div class="stats">
      <div class="stat"><b>${done}/${tasks.length || 0}</b><span>Done today</span></div>
      <div class="stat"><b>${state.dump.filter((d) => d.status === "inbox").length}</b><span>In the dump</span></div>
      <div class="stat"><b>${habitHitsToday()}</b><span>Habits checked</span></div>
    </div>
    ${showLeftovers ? renderLeftovers(leftovers) : ""}
    <div class="grid-2">
      <section class="card">
        <h2>Today's three</h2>
        <p class="hint">If it doesn't fit here, it belongs in the dump.</p>
        <div class="task-list">
          ${tasks.map(taskRow).join("") || `<p class="empty">Nothing yet. Add one small thing.</p>`}
        </div>
        <div class="row" style="margin-top:12px">
          <input class="input" id="new-task" placeholder="A task small enough to start" ${tasks.length >= cap ? "disabled" : ""} />
          <button class="btn" id="add-task" ${tasks.length >= cap ? "disabled" : ""}>Add</button>
        </div>
        <div class="enough ${state.enoughByDay[t] || (tasks.length && done === tasks.length) ? "show" : ""}" id="enough">
          That's enough for today, ${showname()}. The rest can wait.
        </div>
      </section>
      <div>
        <section class="card" style="margin-bottom:18px">
          <h2>Quick dump</h2>
          <p class="hint">Don't sort it. Just get it out.</p>
          <div class="row">
            <input class="input" id="quick-dump" placeholder="A thought, a chore, a worry…" />
            <button class="btn soft" id="add-dump">Park</button>
          </div>
        </section>
        <section class="card">
          <h2>Note to self</h2>
          <textarea class="input" id="day-note" rows="4" placeholder="How's the brain today?">${escapeHtml(state.noteByDay[t] || "")}</textarea>
        </section>
      </div>
    </div>
  `;
}

function renderLow() {
  const t = todayISO();
  const resets = state.lowResets[t] || {};
  const tasks = state.tasksByDay[t];
  return `
    <div class="topbar">
      <div>
        <p class="kicker">${formatPretty(t)}</p>
        <h1 class="page-title">Low-energy mode</h1>
        <p class="page-sub">The bar is on the floor. That's the design.</p>
      </div>
      <div class="energy-pills">${energyButtons()}</div>
    </div>
    <div class="permission">
      <h2>Permission slip</h2>
      <p class="hint" style="margin:0">You don't have to earn rest. Survive the day. Tomorrow can be medium.</p>
    </div>
    <div class="grid-2">
      <section class="card">
        <h2>The reset</h2>
        <p class="hint">Tap what's done. Skip the rest without guilt.</p>
        <div class="low-stack">
          ${LOW_RESETS.map((item) => `
            <button class="reset-item" data-reset="${item.id}">
              <span class="check" style="${resets[item.id] ? "background:var(--sage);border-color:var(--sage)" : ""}">${resets[item.id] ? "✓" : ""}</span>
              <span>${item.name}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="card">
        <h2>One tiny thing</h2>
        <p class="hint">Optional. One is heroic.</p>
        <div class="task-list">${tasks.slice(0, 1).map(taskRow).join("") || `<p class="empty">If you want, add one microscopic task.</p>`}</div>
        ${tasks.length ? "" : `
          <div class="row" style="margin-top:12px">
            <input class="input" id="new-task" placeholder="e.g. put cup in sink" />
            <button class="btn" id="add-task">Add</button>
          </div>`}
        <button class="btn ghost full" style="margin-top:14px" data-nav="dopamine">Open the dopamine menu</button>
      </section>
    </div>
  `;
}

function renderLeftovers(items) {
  return `
    <div class="leftovers">
      <strong>Yesterday left a few things.</strong>
      <p class="hint" style="margin:6px 0 8px">Bring one forward, park them, or let them go.</p>
      ${items.map((item) => `<span class="chip">${escapeHtml(item.text)}</span>`).join("")}
      <div class="row" style="margin-top:12px">
        <button class="btn soft" id="bring-leftovers">Bring to today</button>
        <button class="btn ghost" id="park-leftovers">Park in dump</button>
        <button class="btn ghost" id="drop-leftovers">Let them go</button>
      </div>
    </div>
  `;
}

function taskRow(task) {
  return `
    <div class="task ${task.done ? "done" : ""}" data-task="${task.id}">
      <button class="check" data-toggle="${task.id}">${task.done ? "✓" : ""}</button>
      <textarea class="task-text" data-edit="${task.id}" rows="1">${escapeHtml(task.text)}</textarea>
      <button class="icon-btn" data-delete="${task.id}" aria-label="Remove">✕</button>
    </div>
  `;
}
