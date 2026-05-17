/* =========================
   WARD EXPERIENCES™ ENGINE
   app.js v2
========================= */

let data = [];
let unlockLimit = parseInt(localStorage.getItem("unlockLimit")) || 1;
let reads = parseInt(localStorage.getItem("reads")) || 0;
let deviceID = localStorage.getItem("deviceID");

// -------------------------
// DEVICE ID GENERATION
// -------------------------
function generateDeviceID() {
  let id = "WARD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  localStorage.setItem("deviceID", id);
  return id;
}

if (!deviceID) {
  deviceID = generateDeviceID();
}

// Display device ID
window.onload = function () {
  document.getElementById("deviceIDBox").innerText = deviceID;
  renderCards();
  updateLockState();
};

// -------------------------
// LOAD CONTENT
// -------------------------
fetch("content.json")
  .then(res => res.json())
  .then(json => {
    data = json.cards;
    renderCards();
    updateLockState();
  });

// -------------------------
// RENDER CARDS
// -------------------------
function renderCards() {
  let container = document.getElementById("card-container");
  container.innerHTML = "";

  data.forEach((card, index) => {

    let isLocked = index >= unlockLimit;

    let div = document.createElement("div");
    div.className = "card " + (isLocked ? "locked" : "");

    div.innerHTML = `
      <h2>${card.title}</h2>
      <h4>${card.subtitle}</h4>
      <p>${isLocked ? "🔒 Locked Clinical Experience" : card.content}</p>
    `;

    container.appendChild(div);
  });
}

// -------------------------
// READ TRACKING SYSTEM
// -------------------------
function trackRead() {
  reads += 1;
  localStorage.setItem("reads", reads);

  // Progressive unlocking pressure
  if (reads % 3 === 0) {
    document.getElementById("status").innerText =
      "⚠️ Access pressure increasing. Unlock required for continuation.";
  }
}

// call tracking whenever user scrolls or interacts
document.addEventListener("scroll", trackRead);

// -------------------------
// CODE VALIDATION ENGINE
// -------------------------
function unlockContent() {
  let input = document.getElementById("codeInput").value;

  fetch("codes.json")
    .then(res => res.json())
    .then(dataCodes => {

      let match = dataCodes.codes.find(c => c.code === input);

      if (match) {

        unlockLimit = match.unlockCardsUntil;
        localStorage.setItem("unlockLimit", unlockLimit);

        document.getElementById("status").innerText =
          "✅ Access granted. Archive partially unlocked.";

        renderCards();
        updateLockState();

      } else {
        document.getElementById("status").innerText =
          "❌ Invalid code. Access denied.";
      }
    });
}

// -------------------------
// LOCK STATE CONTROL
// -------------------------
function updateLockState() {
  let overlay = document.getElementById("lockOverlay");

  if (unlockLimit <= 1) {
    overlay.style.display = "flex";
  } else {
    overlay.style.display = "none";
  }
}

// -------------------------
// DEVICE ID COPY
// -------------------------
function copyDeviceID() {
  navigator.clipboard.writeText(deviceID);
  alert("Device ID copied");
}
