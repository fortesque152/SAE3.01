// routeButtons.js
export async function initRouteButtons(app) {
  const routeBtn = document.getElementById("routeBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const routeInfo = document.getElementById("routeInfo");

  if (!routeBtn || !cancelBtn || !routeInfo) {
    console.error("Éléments DOM manquants pour la navigation");
    return;
  }

  /** Calcule la distance en mètres entre deux points */
  function haversineMeters(a, b) {
    const R = 6371e3; // rayon Terre en mètres
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;

    const sinΔφ = Math.sin(Δφ / 2);
    const sinΔλ = Math.sin(Δλ / 2);

    const x = sinΔφ ** 2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ ** 2;

    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  /** Trouve le parking le plus proche compatible avec le véhicule */
  function findNearestParking(userPos, parkings, vehicleType) {
    const compatibleParkings = parkings.filter(p => p.canPark(vehicleType));
    if (compatibleParkings.length === 0) return null;

    let nearest = compatibleParkings[0];
    let minDist = haversineMeters(userPos, nearest.getLocation());

    for (const p of compatibleParkings) {
      const dist = haversineMeters(userPos, p.getLocation());
      if (dist < minDist) {
        nearest = p;
        minDist = dist;
      }
    }
    return nearest;
  }

  /** Clic sur bouton "Itinéraire" */
  routeBtn.addEventListener("click", async () => {
    const vehicle = app.user.getCurrentVehicle();
    const vehicleType = vehicle ? vehicle.name : null;
    const parkings = (app.parkingService && (await app.parkingService.getParkings(app.user, app.userPos))) || [];

    if (!app.userPos || parkings.length === 0 || !vehicleType) {
      console.log("Debug - userPos:", app.userPos, "parkings:", parkings.length, "vehicleType:", vehicleType);
      alert("Position, parkings ou véhicule indisponible.");
      return;
    }

    const nearest = findNearestParking(app.userPos, parkings, vehicleType);
    if (!nearest) {
      alert("Aucun parking compatible pour votre véhicule.");
      return;
    }

    app.nearestParking = nearest;

    // Affiche marker et itinéraire
    if (app.mapView) {
      app.mapView.setNearestParkingMarker(nearest);
    }
    if (app.startTracking) {
      app.startTracking();
    }
    const result = await app.showRoute(app.userPos, nearest.getLocation());

    if (result) {
      routeInfo.textContent = `Distance : ${result.distanceKm} km | Durée : ${result.duration}`;
      routeInfo.style.display = "block";
    }

    // Affiche le bouton Annuler
    cancelBtn.style.display = "block";

    // Désactive le bouton Itinéraire
    routeBtn.disabled = true;
    routeBtn.textContent = "Itinéraire affiché";
  });

  /** Clic sur bouton "Annuler" */
  cancelBtn.addEventListener("click", () => {
    // Arrêter le tracking qui gère aussi la navigation UI
    if (app.stopTracking) {
      app.stopTracking();
    }

    // Reset état
    routeBtn.disabled = false;
    routeBtn.textContent = "Aller au parking le plus proche";
    cancelBtn.style.display = "none";
    routeInfo.style.display = "none";
    app.nearestParking = null;
  });

  /** Événement "M'y rendre" depuis un popup de parking */
  document.addEventListener("navigateToParking", async (e) => {
    const parking = e.detail;
    
    if (!app.userPos) {
      alert("Position utilisateur indisponible.");
      return;
    }

    app.nearestParking = parking;

    // Affiche marker et itinéraire
    if (app.mapView) {
      app.mapView.setNearestParkingMarker(parking);
    }
    if (app.startTracking) {
      app.startTracking();
    }
    const result = await app.showRoute(app.userPos, parking.getLocation());

    if (result) {
      routeInfo.textContent = `Distance : ${result.distanceKm} km | Durée : ${result.duration}`;
      routeInfo.style.display = "block";
    }

    // Affiche le bouton Annuler
    cancelBtn.style.display = "block";

    // Désactive le bouton Itinéraire
    routeBtn.disabled = true;
    routeBtn.textContent = "Itinéraire affiché";
  });
}
