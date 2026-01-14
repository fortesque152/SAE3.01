export async function initFavoritesUI(app) {
  const favoritesList = document.getElementById("favoritesList");
  const routeInfo = document.getElementById("routeInfo");

  async function loadFavorites() {
    const res = await fetch("./vue/get_favorites.php", {
      credentials: "include",
    });
    const data = await res.json();

    favoritesList.innerHTML = "";

    data.favorites.forEach(f => {
      favoritesList.innerHTML += `
        <div class="favorite-item">
          <span>${f.name}</span>
          <button class="goFav" data-id="${f.parking_id}">Aller</button>
          <button class="removeFav" data-id="${f.parking_id}">Supprimer</button>
        </div>
      `;
    });
  }

  favoritesList.addEventListener("click", async e => {
    if (e.target.classList.contains("goFav")) {
      const parkingId = e.target.dataset.id;

      const res = await fetch("./vue/get_parking_coords.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingId }),
      });

      const data = await res.json();
      app.nearestParking = { location: data };
      app.startTracking();
    }

    if (e.target.classList.contains("removeFav")) {
      await fetch("./vue/remove_favorite.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingId: e.target.dataset.id }),
      });
      loadFavorites();
    }
  });

  loadFavorites();
}
