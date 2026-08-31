function renderDump() {
  const inbox = state.dump.filter((d) => d.status === "inbox");
  const later = state.dump.filter((d) => d.status === "later");
  return `
    <div class="topbar">
      <div>
        <p class="kicker">Get it out of your head</p>
        <h1 class="page-title">Brain dump</h1>
        <p class="page-sub">Capture now. Sort when the fog lifts.</p>
      </div>
    </div>
    <section class="card" style="margin-bottom:18px">
      <div class="row">
        <input class="input" id="dump-input" placeholder="Everything counts. Appointments, shame, brilliant ideas…" />
        <button class="btn" id="dump-add">Dump</button>
      </div>
    </section>
    <div class="grid-2">
      <section class="card">
        <h2>Inbox</h2>
        <p class="hint">${inbox.length} unsorted item${inbox.length === 1 ? "" : "s"}.</p>
        ${inbox.map(dumpRow).join("") || `<p class="empty">Empty head. Rare and excellent.</p>`}
      </section>
      <section class="card">
        <h2>Later</h2>
        <p class="hint">Not today. Still safe.</p>
        ${later.map(dumpRow).join("") || `<p class="empty">Nothing parked.</p>`}
      </section>
    </div>
  `;
}

function dumpRow(item) {
  return `
    <div class="dump-item">
      <div>${escapeHtml(item.text)}<div class="hint" style="margin:4px 0 0">${item.created}</div></div>
      <div class="dump-actions">
        ${item.status === "inbox" ? `<button class="tiny" data-promote="${item.id}">Make a task</button>` : ""}
        ${item.status === "inbox" ? `<button class="tiny" data-later="${item.id}">Later</button>` : `<button class="tiny" data-inbox="${item.id}">Back to inbox</button>`}
        <button class="tiny" data-dump-del="${item.id}">Done / drop</button>
      </div>
    </div>
  `;
}

function renderFocus() {
  const c = 2 * Math.PI * 80;
  const offset = c * (1 - timer.remaining / timer.total);
  return `
    <div class="topbar">
      <div>
        <p class="kicker">Body doubling, minus the other body</p>
        <h1 class="page-title">Focus</h1>
        <p class="page-sub">Pick a short window. Stop when it ends. That's the whole method.</p>
      </div>
    </div>
    <section class="card">
      <div class="presets">
        ${[10, 15, 25].map((m) => `
          <button class="pill ${state.focusMinutes === m ? "on" : ""}" data-mins="${m}">${m} min</button>
        `).join("")}
      </div>
      <div class="ring-wrap">
        <svg class="ring" viewBox="0 0 180 180">
          <circle class="track" cx="90" cy="90" r="80"></circle>
          <circle class="prog" data-ring cx="90" cy="90" r="80"
            stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
        </svg>
      </div>
      <div class="timer-face">
        <div class="time" data-time-face>${formatTime(timer.remaining)}</div>
        <p class="hint">${timer.running ? "You're in a window. Just this." : timer.remaining === 0 ? "Window closed. Take a breath." : "Not a race. A container."}</p>
      </div>
      <div class="timer-actions">
        <button class="btn" id="timer-toggle">${timer.running ? "Pause" : timer.remaining === 0 ? "Reset" : "Start"}</button>
        <button class="btn ghost" id="timer-reset">Reset</button>
      </div>
    </section>
  `;
}

function renderHabits() {
  const t = todayISO();
  const days = [0,1,2,3,4,5,6].map((i) => addDays(t, i - 6));
  return `
    <div class="topbar">
      <div>
        <p class="kicker">Showed up, not streak-shamed</p>
        <h1 class="page-title">Habits</h1>
        <p class="page-sub">Empty days are just empty. They don't erase the ones you did.</p>
      </div>
    </div>
    <section class="card">
      ${state.habits.map((habit) => `
        <div class="habit">
          <div>
            <strong>${escapeHtml(habit.name)}</strong>
            <div class="hint" style="margin:0">This week: ${days.filter((d) => habit.logs[d]).length} days</div>
          </div>
          <div class="days">
            ${days.map((d) => `
              <button class="day ${habit.logs[d] ? "on" : ""} ${d === t ? "today" : ""}" data-habit="${habit.id}" data-day="${d}">
                ${weekdayShort(d)}
              </button>
            `).join("")}
          </div>
        </div>
      `).join("")}
      <div class="row" style="margin-top:16px">
        <input class="input" id="new-habit" placeholder="Add a tiny habit" />
        <button class="btn" id="add-habit">Add</button>
      </div>
    </section>
  `;
}

function renderDopamine() {
  return `
    <div class="topbar">
      <div>
        <p class="kicker">When starting feels impossible</p>
        <h1 class="page-title">Dopamine menu</h1>
        <p class="page-sub">Pick something small. Use it as a bridge, not a rabbit hole.</p>
      </div>
    </div>
    <div class="dop-grid">
      ${state.dopamine.map((item) => `
        <button class="dop-card" data-dop="${item.id}">
          <div class="tag">${escapeHtml(item.mins)}</div>
          <b>${escapeHtml(item.title)}</b>
          <span>${escapeHtml(item.note)}</span>
        </button>
      `).join("")}
    </div>
    <section class="card" style="margin-top:18px">
      <h2>Add your own</h2>
      <p class="hint">The best menu is the one you'll actually use.</p>
      <div class="row">
        <input class="input" id="dop-title" placeholder="e.g. water the plants" />
        <input class="input" id="dop-mins" placeholder="5 min" style="max-width:120px" />
        <button class="btn" id="add-dop">Add</button>
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <div class="topbar">
      <div>
        <p class="kicker">Make it yours</p>
        <h1 class="page-title">Settings</h1>
      </div>
    </div>
    <section class="card" style="margin-bottom:18px">
      <h2>Profile</h2>
      <p class="hint">Used only for greetings. Stored on this device.</p>
      <input class="input" id="set-name" value="${escapeHtml(state.name)}" placeholder="Name" />
    </section>
    <section class="card" style="margin-bottom:18px">
      <h2>Theme</h2>
      <p class="hint">Ink is the default. Paper if daylight helps.</p>
      <div class="energy-pills">
        ${["ink", "dusk", "paper"].map((th) => `
          <button class="pill ${state.theme === th ? "on" : ""}" data-theme="${th}">${th[0].toUpperCase() + th.slice(1)}</button>
        `).join("")}
      </div>
    </section>
    <section class="card" style="margin-bottom:18px">
      <h2>Data</h2>
      <p class="hint">Export a backup, or start clean. This app never talks to a server.</p>
      <div class="row">
        <button class="btn soft" id="export">Export JSON</button>
        <button class="btn ghost" id="import">Import</button>
        <button class="btn ghost" id="reset">Reset everything</button>
      </div>
      <input type="file" id="import-file" accept="application/json" hidden />
    </section>
  `;
}

function habitHitsToday() {
  const t = todayISO();
  return state.habits.filter((h) => h.logs[t]).length;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
