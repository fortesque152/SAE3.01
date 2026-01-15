// js/panelUI.js

export function initPanelUI() {
  const panelToggle = document.getElementById("panelToggle");
  const panelClose = document.getElementById("panelClose");
  const userPanel = document.getElementById("userPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  panelToggle.addEventListener("click", () => {
    userPanel.classList.add("open");
  });

  panelClose.addEventListener("click", () => {
    userPanel.classList.remove("open");
  });

  // Gestion de la déconnexion
  logoutBtn.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      window.location.href = "../app/views/logout.php";
    }
  });
}
