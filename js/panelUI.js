// js/panelUI.js

export function initPanelUI() {
  const panelToggle = document.getElementById("panelToggle");
  const panelClose = document.getElementById("panelClose");
  const userPanel = document.getElementById("userPanel");

  panelToggle.addEventListener("click", () => {
    userPanel.classList.add("open");
  });

  panelClose.addEventListener("click", () => {
    userPanel.classList.remove("open");
  });
}
