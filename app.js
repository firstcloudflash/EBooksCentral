/* ==================================================
   WARD EXPERIENCES™
   Clinical Archive Engine v3
================================================== */

/* =========================
   GLOBAL STATE
========================= */

let cardsData = [];

let unlockLimit =
  StorageEngine.getUnlockLimit();

let reads =
  StorageEngine.getReads();

let deviceID =
  StorageEngine.getDeviceID();

let accessPlan =
  StorageEngine.getAccessPlan();

/* =========================
   INITIALIZE SYSTEM
========================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeDevice();

  updateStatusBar();

  loadContent();

  attachTracking();

});

/* =========================
   DEVICE INITIALIZATION
========================= */

function initializeDevice() {

  if (!deviceID) {

    deviceID =
      generateDeviceID();

    StorageEngine.setDeviceID(deviceID);

  }

  const deviceBox =
    document.getElementById("deviceIDBox");

  if (deviceBox) {

    deviceBox.innerText = deviceID;

  }

}

/* =========================
   GENERATE DEVICE ID
========================= */

function generateDeviceID() {

  const random =
    Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

  return `WARD-${random}`;

}

/* =========================
   LOAD CONTENT
========================= */

async function loadContent() {

  try {

    const response =
      await fetch("content.json");

    const json =
      await response.json();

    cardsData = json.cards || [];

    renderCards();

    updateProgress();

    updateLockState();

  } catch (error) {

    console.error(
      "Failed to load content:",
      error
    );

  }

}

/* =========================
   RENDER FLASHCARDS
========================= */

function renderCards() {

  const container =
    document.getElementById("card-container");

  if (!container) return;

  container.innerHTML = "";

  cardsData.forEach((card, index) => {

    const isLocked =
      index >= unlockLimit;

    const div =
      document.createElement("div");

    div.className =
      `card ${isLocked ? "locked" : ""}`;

    const lessonsHTML =
      card.content.clinical_lessons
        .map(
          lesson =>
            `<li>${lesson}</li>`
        )
        .join("");

    div.innerHTML = `

      <div class="card-top">

        <div class="card-badge">
          ${card.ward}
        </div>

        <div class="card-time">
          ${card.time}
        </div>

      </div>

      <h2>${card.title}</h2>

      <h4>${card.subtitle}</h4>

      ${
        isLocked
          ? `
          <div class="locked-content">
            🔒 Restricted Clinical Experience
          </div>
        `
          : `
          <div class="story-block">
            <p>${card.content.story}</p>
          </div>

          <div class="lesson-block">

            <h5>Clinical Lessons</h5>

            <ul>
              ${lessonsHTML}
            </ul>

          </div>

          <div class="psych-block">

            <h5>Psychological Insight</h5>

            <p>
              ${card.content.psychological_insight}
            </p>

          </div>
        `
      }

    `;

    div.addEventListener("click", () => {

      if (!isLocked) {

        StorageEngine.setLastCard(card.id);

      }

    });

    container.appendChild(div);

  });

}

/* =========================
   UNLOCK SYSTEM
========================= */

async function unlockContent() {

  const input =
    document
      .getElementById("codeInput")
      .value
      .trim()
      .toUpperCase();

  const status =
    document.getElementById("status");

  if (!input) {

    status.innerText =
      "⚠️ Enter a Gatekeeper Code.";

    return;

  }

  try {

    const response =
      await fetch("codes.json");

    const data =
      await response.json();

    const match =
      data.codes.find(
        code =>
          code.code === input &&
          code.status === "active"
      );

    if (match) {

      unlockLimit =
        match.unlockCardsUntil;

      accessPlan =
        match.plan;

      StorageEngine.setUnlockLimit(
        unlockLimit
      );

      StorageEngine.setAccessPlan(
        accessPlan
      );

      StorageEngine.setActiveCode(
        match.code
      );

      StorageEngine.setExpiration(
        match.expires
      );

      status.innerText =
        `✅ ${match.plan} Activated`;

      status.style.color =
        "var(--success)";

      renderCards();

      updateProgress();

      updateStatusBar();

      updateLockState();

    } else {

      status.innerText =
        "❌ Invalid or inactive code.";

      status.style.color =
        "var(--danger)";

    }

  } catch (error) {

    console.error(error);

    status.innerText =
      "⚠️ Unable to validate access code.";

  }

}

/* =========================
   UPDATE STATUS BAR
========================= */

function updateStatusBar() {

  const unlockCount =
    document.getElementById(
      "unlockCount"
    );

  const readCount =
    document.getElementById(
      "readCount"
    );

  const planLabel =
    document.getElementById(
      "planLabel"
    );

  if (unlockCount) {

    unlockCount.innerText =
      unlockLimit;

  }

  if (readCount) {

    readCount.innerText =
      reads;

  }

  if (planLabel) {

    planLabel.innerText =
      accessPlan;

  }

}

/* =========================
   PROGRESS SYSTEM
========================= */

function updateProgress() {

  const progressFill =
    document.getElementById(
      "progressFill"
    );

  const progressPercent =
    document.getElementById(
      "progressPercent"
    );

  if (!cardsData.length) return;

  const percent =
    Math.min(
      Math.floor(
        (unlockLimit /
          cardsData.length) *
          100
      ),
      100
    );

  if (progressFill) {

    progressFill.style.width =
      `${percent}%`;

  }

  if (progressPercent) {

    progressPercent.innerText =
      `${percent}%`;

  }

}

/* =========================
   LOCK OVERLAY CONTROL
========================= */

function updateLockState() {

  const overlay =
    document.getElementById(
      "lockOverlay"
    );

  if (!overlay) return;

  if (unlockLimit <= 1) {

    overlay.style.display =
      "flex";

  } else {

    overlay.style.display =
      "none";

  }

}

/* =========================
   COPY DEVICE ID
========================= */

function copyDeviceID() {

  navigator.clipboard
    .writeText(deviceID)
    .then(() => {

      alert(
        "Device Identity copied"
      );

    });

}

/* =========================
   READ TRACKING
========================= */

function attachTracking() {

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {

      if (!ticking) {

        window.requestAnimationFrame(
          () => {

            trackRead();

            ticking = false;

          }
        );

        ticking = true;

      }

    }
  );

}

/* =========================
   TRACK READS
========================= */

function trackRead() {

  reads++;

  StorageEngine.incrementReads();

  updateStatusBar();

  behavioralPressure();

}

/* =========================
   BEHAVIORAL MONETIZATION
========================= */

function behavioralPressure() {

  const status =
    document.getElementById(
      "status"
    );

  if (!status) return;

  if (reads === 5) {

    status.innerText =
      "🔒 Additional clinical archives require premium access.";

  }

  if (reads === 10) {

    status.innerText =
      "⚠️ Archive restriction intensifying.";

  }

  if (reads === 15) {

    status.innerText =
      "🧠 Unlock deeper psychological clinical experiences.";

  }

}

/* =========================
   AUTO SESSION CHECK
========================= */

(function sessionCheck() {

  const expiration =
    StorageEngine.getExpiration();

  if (!expiration) return;

  const today =
    new Date();

  const expiry =
    new Date(expiration);

  if (today > expiry) {

    StorageEngine.lockSystem();

    unlockLimit = 1;

    accessPlan = "Expired";

  }

})();
