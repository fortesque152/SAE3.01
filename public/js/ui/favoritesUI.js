import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";

export async function initFavoritesUI(app) {
  const favoritesList = document.getElementById("favoritesList");
  const routeInfo = document.getElementById("routeInfo");
  const cancelBtn = document.getElementById("cancelBtn");
  const routeBtn = document.getElementById("routeBtn");

  let favoritesData = [];

  async function loadFavorites() {
    const res = await fetch("../app/api/favorites.php", {
      credentials: "include",
    });
    const data = await res.json();

    favoritesData = data.favorites || [];
    renderFavorites();
  }

  function renderFavorites() {
    favoritesList.innerHTML = "";

    favoritesData.forEach(f => {
      favoritesList.innerHTML += `
        <div class="favorite-item">
          <span>${f.name}</span>
          <button class="goFav" data-id="${f.parking_id}">Aller</button>
          <button class="removeFav" data-id="${f.parking_id}">Supprimer</button>
        </div>
      `;

    });
  }
  // Écoute les favoris ajoutés depuis la carte
  document.addEventListener("favoriteAdded", e => {
    const fav = e.detail;
    // Évite les doublons
    if (!favoritesData.find(f => f.apiId === fav.apiId)) {
      loadFavorites();
      renderFavorites();
    }
  });

  favoritesList.addEventListener("click", async e => {
    const target = e.target;
    if (!target) return;

    if (target.classList.contains("goFav")) {
      const parkingId = target.dataset.id;
      const res = await fetch("../app/api/parking-coords.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingId }),
      });

      const data = await res.json();
      if (!data.success) return alert("Parking introuvable");

      const nearest = new Parking(data.apiId, data.name, new GeoLocation(data.latitude, data.longitude));
      app.nearestParking = nearest;
      app.mapView.setNearestParkingMarker(nearest);
      app.startTracking();
      const result = await app.showRoute(app.userPos, nearest.getLocation());
      console.log(result)
      if (result) {
        routeInfo.textContent = `Distance : ${result.distanceKm} km | Durée : ${result.duration}`;
        routeInfo.style.display = "block";
      }

      // Affiche le bouton Annuler
      cancelBtn.style.display = "block";

      // Désactive le bouton Itinéraire
      routeBtn.disabled = true;
      routeBtn.textContent = "Itinéraire affiché";

    }

    if (target.classList.contains("removeFav")) {
      const parkingId = target.dataset.id;
      console.log(target.dataset);
      await fetch("../app/api/favorites.php", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parking_id: parkingId }),
      });

      // Met à jour localement sans recharger tout du serveur
      favoritesData = favoritesData.filter(f => String(f.parking_id) !== String(parkingId));
      renderFavorites();
    }
  });


  await loadFavorites();
}
