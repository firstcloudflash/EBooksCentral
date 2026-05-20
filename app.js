/* =========================================================
   WARD EXPERIENCES™
   Clinical Archive Engine v5
========================================================= */

/* =========================
   GLOBAL STATE
========================= */

let archiveData = null;

let cards = [];

let activeFilter = "All Wards";

/* =========================
   DOM ELEMENTS
========================= */

const cardsContainer =
  document.getElementById("cardsContainer");

const loaderScreen =
  document.getElementById("loaderScreen");

const emptyState =
  document.getElementById("emptyState");

const totalExperiences =
  document.getElementById("totalExperiences");

const filterButtons =
  document.querySelectorAll(".filter-btn");

/* =========================
   MODAL ELEMENTS
========================= */

const modal =
  document.getElementById("experienceModal");

const modalBackdrop =
  document.getElementById("modalBackdrop");

const closeModalBtn =
  document.getElementById("closeModal");

const modalWard =
  document.getElementById("modalWard");

const modalTime =
  document.getElementById("modalTime");

const modalTitle =
  document.getElementById("modalTitle");

const modalSubtitle =
  document.getElementById("modalSubtitle");

const modalStory =
  document.getElementById("modalStory");

const modalLessons =
  document.getElementById("modalLessons");

const modalInsight =
  document.getElementById("modalInsight");

/* =========================
   INITIALIZE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeArchive
);

/* =========================
   INITIALIZER
========================= */

async function initializeArchive() {

  initializeEffects();

  initializeFilters();

  await loadArchive();

}

/* =========================
   LOAD ARCHIVE
========================= */

async function loadArchive() {

  try {

    const response =
      await fetch("content.json");

    archiveData =
      await response.json();

    cards =
      archiveData.cards || [];

    updateStats();

    renderCards(cards);

    hideLoader();

  }

  catch (error) {

    console.error(
      "Archive failed to load:",
      error
    );

    showArchiveError();

  }

}

/* =========================
   UPDATE STATS
========================= */

function updateStats() {

  if (totalExperiences) {

    totalExperiences.textContent =
      cards.length;

  }

}

/* =========================
   INITIALIZE FILTERS
========================= */

function initializeFilters() {

  filterButtons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        filterButtons.forEach((btn) => {

          btn.classList.remove("active");

        });

        button.classList.add("active");

        activeFilter =
          button.dataset.filter;

        filterCards();

      }
    );

  });

}

/* =========================
   FILTER CARDS
========================= */

function filterCards() {

  if (activeFilter === "All Wards") {

    renderCards(cards);

    return;

  }

  const filteredCards =
    cards.filter((card) => {

      return card.ward === activeFilter;

    });

  renderCards(filteredCards);

}

/* =========================
   RENDER CARDS
========================= */

function renderCards(data) {

  cardsContainer.innerHTML = "";

  if (!data.length) {

    showEmptyState();

    return;

  }

  hideEmptyState();

  data.forEach((card, index) => {

    const cardElement =
      createCard(card, index);

    cardsContainer.appendChild(
      cardElement
    );

  });

}

/* =========================
   CREATE CARD
========================= */

function createCard(card, index) {

  const article =
    document.createElement("article");

  article.className = "card";

  article.style.animationDelay =
    `${index * 0.06}s`;

  article.innerHTML = `

    <div class="card-top">

      <span class="card-badge">
        ${card.ward}
      </span>

      <span class="card-time">
        ${card.time}
      </span>

    </div>

    <h2>
      ${card.title}
    </h2>

    <h4>
      ${card.subtitle}
    </h4>

    <div class="story-block">

      <p>
        ${truncateStory(
          card.content.story,
          260
        )}
      </p>

    </div>

    <div class="lesson-block">

      <h5>
        Clinical Lessons
      </h5>

      <ul>

        ${card.content.clinicalLessons
          .slice(0, 2)
          .map(
            (lesson) => `
              <li>${lesson}</li>
            `
          )
          .join("")}

      </ul>

    </div>

    <div class="psych-block">

      <h5>
        Psychological Insight
      </h5>

      <p>
        ${card.content.psychologicalInsight}
      </p>

    </div>

  `;

  article.addEventListener(
    "click",
    () => openModal(card)
  );

  return article;

}

/* =========================
   TRUNCATE STORY
========================= */

function truncateStory(text, limit) {

  if (text.length <= limit) {

    return formatParagraphs(text);

  }

  return (
    formatParagraphs(
      text.substring(0, limit)
    ) + "..."
  );

}

/* =========================
   FORMAT PARAGRAPHS
========================= */

function formatParagraphs(text) {

  return text.replace(/\n/g, "<br>");

}

/* =========================
   OPEN MODAL
========================= */

function openModal(card) {

  modal.classList.remove("hidden");

  document.body.style.overflow =
    "hidden";

  modalWard.textContent =
    card.ward;

  modalTime.textContent =
    card.time;

  modalTitle.textContent =
    card.title;

  modalSubtitle.textContent =
    card.subtitle;

  modalStory.innerHTML =
    formatParagraphs(
      card.content.story
    );

  modalInsight.textContent =
    card.content.psychologicalInsight;

  modalLessons.innerHTML =
    card.content.clinicalLessons
      .map(
        (lesson) =>
          `<li>${lesson}</li>`
      )
      .join("");

  requestAnimationFrame(() => {

    modal.style.opacity = "1";

  });

}

/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

  modal.classList.add("hidden");

  document.body.style.overflow =
    "";

}

/* =========================
   MODAL EVENTS
========================= */

closeModalBtn.addEventListener(
  "click",
  closeModal
);

modalBackdrop.addEventListener(
  "click",
  closeModal
);

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      !modal.classList.contains("hidden")
    ) {

      closeModal();

    }

  }
);

/* =========================
   EMPTY STATE
========================= */

function showEmptyState() {

  emptyState.classList.remove(
    "hidden"
  );

}

function hideEmptyState() {

  emptyState.classList.add(
    "hidden"
  );

}

/* =========================
   LOADER
========================= */

function hideLoader() {

  loaderScreen.style.display =
    "none";

}

/* =========================
   ERROR STATE
========================= */

function showArchiveError() {

  loaderScreen.innerHTML = `

    <div class="empty-icon">
      ⚠
    </div>

    <h3>
      Archive Failed To Load
    </h3>

    <p>
      Please check your content.json file.
    </p>

  `;

}

/* =========================
   EFFECTS
========================= */

function initializeEffects() {

  initializeCardReveal();

  initializeAmbientMovement();

}

/* =========================
   CARD REVEAL
========================= */

function initializeCardReveal() {

  const observer =
    new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
            );

          }

        });

      },

      {
        threshold: 0.12
      }
    );

  const observeLoop =
    setInterval(() => {

      const currentCards =
        document.querySelectorAll(".card");

      currentCards.forEach((card) => {

        observer.observe(card);

      });

      if (currentCards.length) {

        clearInterval(observeLoop);

      }

    }, 400);

}

/* =========================
   AMBIENT MOVEMENT
========================= */

function initializeAmbientMovement() {

  document.addEventListener(
    "mousemove",
    (event) => {

      const x =
        event.clientX / window.innerWidth;

      const y =
        event.clientY / window.innerHeight;

      document.body.style.backgroundPosition =
        `
        ${x * 12}px
        ${y * 12}px
      `;

    }
  );

}

/* =========================
   READING PROGRESS
========================= */

window.addEventListener(
  "scroll",
  () => {

    const scrollTop =
      window.scrollY;

    const docHeight =
      document.body.scrollHeight -
      window.innerHeight;

    const progress =
      (scrollTop / docHeight) * 100;

    document.documentElement.style.setProperty(
      "--scroll-progress",
      `${progress}%`
    );

  }
);

/* =========================
   SMOOTH SCROLL TOP
========================= */

function scrollToTop() {

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}

/* =========================
   CONSOLE BRANDING
========================= */

console.log(`

WARD EXPERIENCES™
Clinical Archive Engine v5

Psychological Clinical Archive Loaded.

`);
