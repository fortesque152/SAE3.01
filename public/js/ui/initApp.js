import { createMobileApp } from "../config/DIContainer.js";
import { UserProfile } from "../modele/UserProfile.js";
import { initVehiclesUI } from "./vehiclesUI.js";
import { initFavoritesUI } from "./favoritesUI.js";
import { initPanelUI } from "./panelUI.js";
import { initRouteButtons } from "./routeButtons.js";

/**
 * SOLID Application Initialization
 * Uses Dependency Injection Container to wire up the application
 */
export async function initApp() {
  const res = await fetch("../app/api/profile.php", { credentials: "include" });
  const data = await res.json();

  const user = new UserProfile({
    profile_id: data.profile.profile_id,
    profile_name: data.profile.name,
    is_pmr: data.profile.is_pmr,
    vehicles: data.profile.vehicles,
    preferences: data.profile.preferences,
  });

  // Afficher le nom de l'utilisateur dans le panneau
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = `Connecté en tant que :  ${data.profile.name}`;
  }

  // Create app using dependency injection
  const app = createMobileApp(user);
  await app.start();

  // Initialisation des UI
  initPanelUI();
  initVehiclesUI(user);
  initFavoritesUI(app);
  initRouteButtons(app);
}

initApp();
