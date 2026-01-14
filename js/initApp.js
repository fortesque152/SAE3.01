import { MobileApp } from "../module/MobileApp.js";
import { UserProfile } from "../module/modele/UserProfile.js";
import { initVehiclesUI } from "./vehiclesUI.js";
import { initFavoritesUI } from "./favoritesUI.js";
import { initPanelUI } from "./panelUI.js";

export async function initApp() {
  const res = await fetch("./vue/get_profile.php", { credentials: "include" });
  const data = await res.json();

  const user = new UserProfile({
    profile_id: data.profile.profile_id,
    profile_name: data.profile.name,
    is_pmr: data.profile.is_pmr,
    vehicles: data.profile.vehicles,
    preferences: data.profile.preferences,
  });

  const app = new MobileApp(user);
  await app.start();

  initPanelUI();
  initVehiclesUI(user);
  initFavoritesUI(app);
}

initApp();
