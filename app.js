/* =========================================================
   WARD EXPERIENCES™
   Clinical Archive Engine v4
========================================================= */

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
   INITIALIZE APP
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeSystem();

  }
);

/* =========================
   INITIALIZE SYSTEM
========================= */

async function initializeSystem() {

  initializeDevice();

  updateStatusBar();

  attachTracking();

  await loadContent();

  restoreUnlockedSession();

}

/* =========================
   DEVICE INITIALIZATION
========================= */

function initializeDevice() {

  if (!deviceID) {

    deviceID =
      generateDeviceID();

    StorageEngine.setDeviceID(
      deviceID
    );

  }

  const deviceBox =
    document.getElementById(
      "deviceIDBox"
    );

  if (deviceBox) {

    deviceBox.innerText =
      deviceID;

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
      await fetch(
        "content.json"
      );

    const json =
      await response.json();

    cardsData =
      json.cards || [];

    renderCards();

    updateProgress();

    updateLockState();

  } catch (error) {

    console.error(
      "Content loading failed:",
      error
    );

  }

}

/* =========================
   RENDER FLASHCARDS
========================= */

function renderCards() {

  const container =
    document.getElementById(
      "card-container"
    );

  if (!container) return;

  container.innerHTML = "";

  cardsData.forEach(
    (card, index) => {

      const isLocked =
        index >= unlockLimit;

      const cardElement =
        document.createElement(
          "div"
        );

      cardElement.className =
        `card ${
          isLocked
            ? "locked"
            : ""
        }`;

      const lessonsHTML =
        card.content
          .clinical_lessons
          .map(
            lesson =>
              `<li>${lesson}</li>`
          )
          .join("");

      cardElement.innerHTML = `

        <div class="card-top">

          <div class="card-badge">
            ${card.ward}
          </div>

          <div class="card-time">
            ${card.time}
          </div>

        </div>

        <h2>
          ${card.title}
        </h2>

        <h4>
          ${card.subtitle}
        </h4>

        ${
          isLocked
            ? `
              <div class="locked-content">
                🔒 Restricted Clinical Archive
              </div>
            `
            : `
              <div class="story-block">

                <p>
                  ${card.content.story}
                </p>

              </div>

              <div class="lesson-block">

                <h5>
                  Clinical Lessons
                </h5>

                <ul>
                  ${lessonsHTML}
                </ul>

              </div>

              <div class="psych-block">

                <h5>
                  Psychological Insight
                </h5>

                <p>
                  ${card.content.psychological_insight}
                </p>

              </div>
            `
        }

      `;

      cardElement.addEventListener(
        "click",
        () => {

          if (!isLocked) {

            StorageEngine.setLastCard(
              card.id
            );

          }

        }
      );

      container.appendChild(
        cardElement
      );

    }
  );

}

/* =========================
   GATEKEEPER UNLOCK
========================= */

async function unlockContent() {

  const input =
    document
      .getElementById(
        "codeInput"
      )
      .value
      .trim()
      .toUpperCase();

  const status =
    document.getElementById(
      "status"
    );

  if (!input) {

    status.innerText =
      "⚠️ Enter Gatekeeper Code.";

    status.style.color =
      "var(--danger)";

    return;

  }

  try {

    const response =
      await fetch(
        "codes.json"
      );

    const data =
      await response.json();

    const gatekeeper =
      data.gatekeeper;

    if (
      input ===
        gatekeeper.code &&
      gatekeeper.status ===
        "active"
    ) {

      unlockLimit = 9999;

      accessPlan =
        "Full Archive Access";

      StorageEngine.setUnlockLimit(
        unlockLimit
      );

      StorageEngine.setAccessPlan(
        accessPlan
      );

      StorageEngine.setActiveCode(
        gatekeeper.code
      );

      status.innerText =
        "✅ Full Clinical Archive Unlocked";

      status.style.color =
        "var(--success)";

      renderCards();

      updateStatusBar();

      updateProgress();

      updateLockState();

      celebrateUnlock();

    } else {

      status.innerText =
        "❌ Invalid Gatekeeper Code.";

      status.style.color =
        "var(--danger)";

    }

  } catch (error) {

    console.error(error);

    status.innerText =
      "⚠️ Unable to validate access.";

    status.style.color =
      "var(--danger)";

  }

}

/* =========================
   RESTORE SESSION
========================= */

function restoreUnlockedSession() {

  const activeCode =
    StorageEngine.getActiveCode();

  if (activeCode) {

    unlockLimit = 9999;

    accessPlan =
      "Full Archive Access";

    renderCards();

    updateStatusBar();

    updateProgress();

    updateLockState();

  }

}

/* =========================
   STATUS BAR
========================= */

function updateStatusBar() {

  const planLabel =
    document.getElementById(
      "planLabel"
    );

  const unlockCount =
    document.getElementById(
      "unlockCount"
    );

  const readCount =
    document.getElementById(
      "readCount"
    );

  if (planLabel) {

    planLabel.innerText =
      accessPlan ||
      "Restricted";

  }

  if (unlockCount) {

    unlockCount.innerText =
      unlockLimit > 1
        ? "Unlocked"
        : "Locked";

  }

  if (readCount) {

    readCount.innerText =
      reads;

  }

}

/* =========================
   UPDATE PROGRESS
========================= */

function updateProgress() {

  const fill =
    document.getElementById(
      "progressFill"
    );

  const percentText =
    document.getElementById(
      "progressPercent"
    );

  if (
    !cardsData.length
  ) return;

  let percent = 0;

  if (unlockLimit > 1) {

    percent = 100;

  }

  if (fill) {

    fill.style.width =
      `${percent}%`;

  }

  if (percentText) {

    percentText.innerText =
      `${percent}%`;

  }

}

/* =========================
   LOCK OVERLAY
========================= */

function updateLockState() {

  const overlay =
    document.getElementById(
      "lockOverlay"
    );

  if (!overlay) return;

  if (unlockLimit > 1) {

    overlay.style.display =
      "none";

  } else {

    overlay.style.display =
      "flex";

  }

}

/* =========================
   COPY DEVICE ID
========================= */

function copyDeviceID() {

  navigator.clipboard
    .writeText(deviceID)
    .then(() => {

      const status =
        document.getElementById(
          "status"
        );

      if (status) {

        status.innerText =
          "📋 Device Identity copied.";

        status.style.color =
          "var(--accent)";

      }

    });

}

/* =========================
   TRACK USER ENGAGEMENT
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

  archivePressureSystem();

}

/* =========================
   ARCHIVE PRESSURE SYSTEM
========================= */

function archivePressureSystem() {

  const status =
    document.getElementById(
      "status"
    );

  if (!status) return;

  if (
    unlockLimit <= 1
  ) {

    if (reads === 5) {

      status.innerText =
        "🔒 Additional experiences remain restricted.";

    }

    if (reads === 10) {

      status.innerText =
        "⚠️ Gatekeeper authorization required.";

    }

    if (reads === 15) {

      status.innerText =
        "🧠 Unlock deeper clinical psychology archives.";

    }

  }

}

/* =========================
   UNLOCK CELEBRATION
========================= */

function celebrateUnlock() {

  document.body.animate(
    [
      {
        opacity: 0.96
      },
      {
        opacity: 1
      }
    ],
    {
      duration: 500
    }
  );

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

    accessPlan =
      "Restricted";

  }

})();
