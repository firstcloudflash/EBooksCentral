/* =========================================
   WARD EXPERIENCES™ STORAGE ENGINE
   storage.js
========================================= */

const StorageEngine = {

  // -----------------------------
  // DEVICE ID
  // -----------------------------
  getDeviceID() {
    return localStorage.getItem("deviceID");
  },

  setDeviceID(id) {
    localStorage.setItem("deviceID", id);
  },

  // -----------------------------
  // UNLOCK LIMIT
  // -----------------------------
  getUnlockLimit() {
    return parseInt(localStorage.getItem("unlockLimit")) || 1;
  },

  setUnlockLimit(limit) {
    localStorage.setItem("unlockLimit", limit);
  },

  // -----------------------------
  // READ COUNTER
  // -----------------------------
  getReads() {
    return parseInt(localStorage.getItem("reads")) || 0;
  },

  incrementReads() {
    let current = this.getReads();
    current++;
    localStorage.setItem("reads", current);
    return current;
  },

  resetReads() {
    localStorage.setItem("reads", 0);
  },

  // -----------------------------
  // LAST OPENED CARD
  // -----------------------------
  getLastCard() {
    return parseInt(localStorage.getItem("lastCard")) || 1;
  },

  setLastCard(cardID) {
    localStorage.setItem("lastCard", cardID);
  },

  // -----------------------------
  // USER ACCESS PLAN
  // -----------------------------
  getAccessPlan() {
    return localStorage.getItem("accessPlan") || "free";
  },

  setAccessPlan(plan) {
    localStorage.setItem("accessPlan", plan);
  },

  // -----------------------------
  // ACTIVE ACCESS CODE
  // -----------------------------
  getActiveCode() {
    return localStorage.getItem("activeCode") || null;
  },

  setActiveCode(code) {
    localStorage.setItem("activeCode", code);
  },

  // -----------------------------
  // ACCESS EXPIRATION
  // -----------------------------
  getExpiration() {
    return localStorage.getItem("expiration") || null;
  },

  setExpiration(date) {
    localStorage.setItem("expiration", date);
  },

  // -----------------------------
  // USER SESSION STATUS
  // -----------------------------
  isUnlocked() {
    return this.getUnlockLimit() > 1;
  },

  lockSystem() {
    localStorage.setItem("unlockLimit", 1);
  },

  // -----------------------------
  // CLEAR ALL DATA
  // -----------------------------
  clearAll() {
    localStorage.clear();
  }

};
