/* =========================================================
   WARD EXPERIENCES™
   Clinical Archive Engine v5 (ELITE SYSTEM)
========================================================= */

/* =========================
   GLOBAL STATE
========================= */

let cardsData = [];

let reads = StorageEngine.getReads();
let deviceID = StorageEngine.getDeviceID();
let accessPlan = StorageEngine.getAccessPlan();

let previewLimit = 2;

let fullUnlock = false;

let softGateTriggered = false;
let paywallShown = false;

let emotionalScore = 0;
let sessionTime = 0;
let scrollDepth = 0;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeSystem();
});

async function initializeSystem() {
  initializeDevice();
  updateStatusBar();
  attachTracking();
  await loadContent();
  restoreSession();
}

/* =========================
   DEVICE
========================= */

function initializeDevice() {
  if (!deviceID) {
    deviceID = generateDeviceID();
    StorageEngine.setDeviceID(deviceID);
  }

  const box = document.getElementById("deviceIDBox");
  if (box) box.innerText = deviceID;
}

function generateDeviceID() {
  return `WARD-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;
}

/* =========================
   CONTENT LOADING
========================= */

async function loadContent() {
  try {
    const res = await fetch("content.json");
    const json = await res.json();

    cardsData = json.cards || [];

    renderCards();
    updateStatusBar();
    updateProgress();
    updateLockState();
  } catch (err) {
    console.error("Content load failed:", err);
  }
}

/* =========================
   RENDER SYSTEM (MEDIUM STYLE)
========================= */

function renderCards() {
  const container = document.getElementById("card-container");
  if (!container) return;

  container.innerHTML = "";

  cardsData.forEach((card, index) => {
    let state = "free";

    if (index >= previewLimit && !fullUnlock) {
      state = "teaser";
    }

    const el = document.createElement("div");
    el.className = `card ${state}`;

    const lessonsHTML = card.content.clinical_lessons
      .map(l => `<li>${l}</li>`)
      .join("");

    el.innerHTML = `
      <div class="card-top">
        <div class="card-badge">${card.ward}</div>
        <div class="card-time">${card.time}</div>
      </div>

      <h2>${card.title}</h2>
      <h4>${card.subtitle}</h4>

      ${
        state === "free" || fullUnlock
          ? `
            <div class="story-block">
              <p>${card.content.story}</p>
            </div>

            <div class="lesson-block">
              <h5>Clinical Lessons</h5>
              <ul>${lessonsHTML}</ul>
            </div>

            <div class="psych-block">
              <h5>Psychological Insight</h5>
              <p>${card.content.psychological_insight}</p>
            </div>
          `
          : `
            <div class="teaser-block">
              🔒 Continue reading unlocks deeper clinical layers
            </div>
          `
      }
    `;

    container.appendChild(el);
  });
}

/* =========================
   TRACKING ENGINE
========================= */

function attachTracking() {
  let start = Date.now();

  window.addEventListener("scroll", () => {
    scrollDepth =
      window.scrollY / document.body.scrollHeight;
  });

  setInterval(() => {
    sessionTime = Date.now() - start;
    reads++;
    StorageEngine.incrementReads();

    updateEmotionalScore();
    updateStatusBar();
  }, 2000);
}

/* =========================
   EMOTIONAL ENGINE
========================= */

function updateEmotionalScore() {
  emotionalScore = 0;

  emotionalScore += reads * 2;
  emotionalScore += sessionTime / 10000;
  emotionalScore += scrollDepth * 10;

  triggerSystemChecks();
}

/* =========================
   TRIGGER SYSTEM
========================= */

function triggerSystemChecks() {
  if (!softGateTriggered && emotionalScore > 5) {
    triggerSoftGate();
  }

  if (!paywallShown && emotionalScore > 12) {
    triggerPaywallMoment();
  }

  if (emotionalScore > 20) {
    triggerHardGate();
  }
}

/* =========================
   SOFT GATE
========================= */

function triggerSoftGate() {
  softGateTriggered = true;

  const status = document.getElementById("status");

  if (status) {
    status.innerText =
      "You are entering deeper clinical layers. Some experiences may soon require Gatekeeper access.";
  }
}

/* =========================
   PAYWALL MOMENT (ELITE)
========================= */

function triggerPaywallMoment() {
  paywallShown = true;

  const overlay = document.getElementById("lockOverlay");

  if (!overlay) return;

  overlay.innerHTML = `
    <div class="lock-box">

      <div class="lock-icon">🧠</div>

      <h2>Depth Threshold Reached</h2>

      <p>
        You’ve engaged deeply with this clinical archive.
        Continue requires Gatekeeper verification.
      </p>

      <input
        type="password"
        id="codeInput"
        class="unlock-input"
        placeholder="Enter Gatekeeper Code"
      >

      <button class="unlock-btn" onclick="unlockContent()">
        Continue Experience
      </button>

    </div>
  `;

  overlay.style.display = "flex";
}

/* =========================
   HARD GATE
========================= */

function triggerHardGate() {
  const overlay = document.getElementById("lockOverlay");
  if (overlay) overlay.style.display = "flex";
}

/* =========================
   UNLOCK SYSTEM
========================= */

async function unlockContent() {
  const input = document
    .getElementById("codeInput")
    .value
    .trim()
    .toUpperCase();

  const res = await fetch("codes.json");
  const data = await res.json();

  const gatekeeper = data.gatekeeper;

  if (input === gatekeeper.code) {
    fullUnlock = true;
    previewLimit = 9999;

    accessPlan = "Elite Clinical Access";

    StorageEngine.setActiveCode(gatekeeper.code);
    StorageEngine.setAccessPlan(accessPlan);

    renderCards();
    updateStatusBar();

    document.getElementById("status").innerText =
      "Access granted. Full clinical archive unlocked.";

  } else {
    document.getElementById("status").innerText =
      "Invalid Gatekeeper Code.";
  }
}

/* =========================
   SESSION RESTORE
========================= */

function restoreSession() {
  const active = StorageEngine.getActiveCode();

  if (active) {
    fullUnlock = true;
    previewLimit = 9999;
    accessPlan = "Elite Clinical Access";
  }
}

/* =========================
   STATUS BAR
========================= */

function updateStatusBar() {
  const plan = document.getElementById("planLabel");
  const unlock = document.getElementById("unlockCount");
  const read = document.getElementById("readCount");

  if (plan) plan.innerText = accessPlan || "Restricted";
  if (unlock) unlock.innerText = fullUnlock ? "Unlocked" : "Reading Mode";
  if (read) read.innerText = reads;
}

/* =========================
   PROGRESS (SIMPLE)
========================= */

function updateProgress() {
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressPercent");

  let percent = fullUnlock ? 100 : 30;

  if (fill) fill.style.width = `${percent}%`;
  if (text) text.innerText = `${percent}%`;
}

/* =========================
   LOCK STATE
========================= */

function updateLockState() {
  const overlay = document.getElementById("lockOverlay");

  if (!overlay) return;

  overlay.style.display = fullUnlock ? "none" : "flex";
}
