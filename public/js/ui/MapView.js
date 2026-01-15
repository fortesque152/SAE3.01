/// <reference lib="dom" />
import { GeoLocation } from "../modele/GeoLocation.js";
import { Parking } from "../modele/Parking.js";
/**
 * Dependency Inversion Principle (DIP):
 * Implement the IMapView interface
 * Single Responsibility Principle (SRP):
 * Only responsible for map visualization and user interaction
 */
export class MapView {
    constructor(locationService) {
        this.userMarker = null;
        this.userPosition = null;
        this.routeLayer = null;
        this.parkingMarkers = new Map();
        this.nearestParkingMarker = null;
        this.locationService = locationService;
        this.parkingMarkers = new Map();
        this.nearestParkingMarker = null;
        this.map = L.map("map").setView([49.11875, 6.1746], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
            noWrap: true,
        }).addTo(this.map);
        this.initMapCenter();
    }
    async initMapCenter() {
        try {
            this.userPosition = await this.locationService.getUserLocation();
            this.map.setView([this.userPosition.latitude, this.userPosition.longitude], 15);
            this.setUserMarker();
        }
        catch (err) {
            console.error("Impossible de récupérer la géolocalisation :", err);
        }
    }
    setUserMarker(location, recenter = true) {
        return Promise.resolve().then(() => {
            const userIcon = L.icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
            if (location)
                this.userPosition = location;
            if (!this.userPosition)
                return;
            if (!this.userMarker) {
                this.userMarker = L.marker([this.userPosition.latitude, this.userPosition.longitude], { title: "Votre position", icon: userIcon }).addTo(this.map);
                if (this.userMarker) {
                    this.userMarker.bindPopup(`<strong>Votre position</strong><br>`);
                }
            }
            else {
                this.userMarker.setLatLng([
                    this.userPosition.latitude,
                    this.userPosition.longitude,
                ]);
            }
            if (recenter) {
                this.centerOnUser(this.userPosition);
            }
        });
    }
    setParkingMarker(parking) {
        const marker = L.marker([
            parking.location.latitude,
            parking.location.longitude,
        ]).addTo(this.map);
        const id = parking.getId();
        if (id)
            this.parkingMarkers.set(String(id), marker);
        // Vérifier si on a des données de disponibilité
        const availableSpots = parking.availableSpots;
        const hasAvailability = availableSpots !== undefined && availableSpots !== null;
        let availabilityHTML = '';
        if (hasAvailability) {
            const totalSpots = parking.totalSpots || availableSpots;
            const percentage = totalSpots > 0 ? (availableSpots / totalSpots) * 100 : 0;
            let availabilityClass = 'availability-low';
            if (percentage > 30) {
                availabilityClass = 'availability-high';
            }
            else if (percentage > 10) {
                availabilityClass = 'availability-medium';
            }
            availabilityHTML = `
        <div class="${availabilityClass}" style="margin: 8px 0; padding: 8px; border-radius: 4px;">
          <strong>Places disponibles:</strong> ${availableSpots}${totalSpots ? ` / ${totalSpots}` : ''}<br>
          <span style="font-size: 0.85em;">● Temps réel</span>
        </div>
      `;
        }
        else {
            availabilityHTML = `
        <div style="margin: 8px 0; padding: 8px; background: #f0f0f0; border-radius: 4px; color: #666;">
          ℹ️ Données de disponibilité non disponibles
        </div>
      `;
        }
        marker.bindPopup(`
    <div class="popup-parking">
      <strong>${parking.getlib()}</strong><br>
      ${availabilityHTML}
      <button class="navigate-btn" style="margin-top: 8px; width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🚗 M'y rendre
      </button>
      <button class="add-fav-btn" style="margin-top: 4px; width: 100%; padding: 8px;">
        ⭐ Ajouter aux favoris
      </button>
    </div>
  `);
        // Event existant (tu le gardes)
        marker.on("click", () => {
            document.dispatchEvent(new CustomEvent("parkingSelected", { detail: parking }));
        });
        // IMPORTANT : récupération correcte des boutons
        marker.on("popupopen", (e) => {
            if (!e.popup)
                return;
            const popupEl = e.popup.getElement();
            // Bouton "M'y rendre"
            const navBtn = popupEl.querySelector(".navigate-btn");
            if (navBtn) {
                navBtn.addEventListener("click", () => {
                    // Fermer le popup
                    marker.closePopup();
                    document.dispatchEvent(new CustomEvent("navigateToParking", { detail: parking }));
                });
            }
            // Bouton favoris
            const btn = popupEl.querySelector(".add-fav-btn");
            if (!btn)
                return;
            btn.addEventListener("click", async () => {
                try {
                    const res = await fetch("../app/api/favorites.php", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            parkingId: parking.getId(),
                            lib: parking.getlib(),
                            long: parking.getLocation().longitude,
                            lat: parking.getLocation().latitude,
                            spot: parking.getSpot(),
                        }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        btn.textContent = "⭐ Ajouté";
                        btn.disabled = true;
                        // Dispatch event pour le panel
                        document.dispatchEvent(new CustomEvent("favoriteAdded", {
                            detail: {
                                apiId: parking.getId(),
                                name: parking.getlib(),
                            },
                        }));
                    }
                    else {
                        alert(data.message || "Erreur ajout favori");
                    }
                }
                catch (err) {
                    console.error(err);
                    alert("Erreur réseau lors de l'ajout du favori");
                }
            });
        });
    }
    setNearestParkingMarker(parking) {
        const iconP = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
        const marker = L.marker([parking.location.latitude, parking.location.longitude], {
            title: "Parking le plus proche",
            icon: iconP,
        }).addTo(this.map);
        if (this.nearestParkingMarker) {
            this.map.removeLayer(this.nearestParkingMarker);
        }
        this.nearestParkingMarker = marker;
        marker.bindPopup(`<strong>Parking le plus proche</strong><br>${parking.getlib()}`);
        console.log(parking);
    }
    /** Navigation mode: show only the target parking marker */
    showOnlyParking(parking) {
        const targetId = parking.getId();
        for (const [id, marker] of this.parkingMarkers.entries()) {
            if (String(id) !== String(targetId) && this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }
        }
        if (targetId && this.parkingMarkers.has(String(targetId))) {
            const m = this.parkingMarkers.get(String(targetId));
            if (m && !this.map.hasLayer(m))
                m.addTo(this.map);
        }
    }
    /** Exit navigation mode: show all parking markers */
    showAllParkings() {
        for (const marker of this.parkingMarkers.values()) {
            if (marker && !this.map.hasLayer(marker))
                marker.addTo(this.map);
        }
    }
    drawRoute(polyline, currentPos, fitBounds = true) {
        if (!polyline || !Array.isArray(polyline) || polyline.length === 0)
            return;
        const coords = polyline.map((c) => [c[1], c[0]]);
        if (currentPos)
            coords.unshift([currentPos.latitude, currentPos.longitude]);
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        this.routeLayer = L.polyline(coords, {
            color: "blue",
            weight: 4,
            opacity: 0.8,
        }).addTo(this.map);
        // Zoom automatique sur la route lors de la première navigation
        if (fitBounds && this.routeLayer) {
            const padding = window.innerWidth < 768 ? [20, 20] : [30, 30];
            this.map.fitBounds(this.routeLayer.getBounds(), {
                padding,
                maxZoom: 17 // Zoom maximum pour une meilleure visibilité lors de la navigation
            });
        }
    }
    setFavoriteParkingMarker(parking) {
        const iconFav = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
        const marker = L.marker([parking.location.latitude, parking.location.longitude], { icon: iconFav, title: "Favorite parking" }).addTo(this.map);
        // on le stocke aussi dans parkingMarkers si tu veux pouvoir le cacher/montrer
        const id = parking._id;
        if (id)
            this.parkingMarkers.set(id, marker);
        // Vérifier si on a des données de disponibilité
        const availableSpots = parking.availableSpots;
        const totalSpots = parking._total_spots;
        const hasAvailability = availableSpots !== undefined && availableSpots !== null;
        let availabilityHTML = '';
        if (hasAvailability) {
            const percentage = totalSpots > 0 ? (availableSpots / totalSpots) * 100 : 0;
            let availabilityClass = 'availability-low';
            if (percentage > 30) {
                availabilityClass = 'availability-high';
            }
            else if (percentage > 10) {
                availabilityClass = 'availability-medium';
            }
            availabilityHTML = `
        <div class="${availabilityClass}" style="margin: 8px 0; padding: 8px; border-radius: 4px;">
          <strong>Places disponibles:</strong> ${availableSpots}${totalSpots ? ` / ${totalSpots}` : ''}<br>
          <span style="font-size: 0.85em;">● Temps réel</span>
        </div>
      `;
        }
        else {
            availabilityHTML = `
        <div style="margin: 8px 0; padding: 8px; background: #f0f0f0; border-radius: 4px; color: #666;">
          ℹ️ Données de disponibilité non disponibles
        </div>
      `;
        }
        marker.bindPopup(`
      <div class="popup-parking">
        <strong>⭐ ${parking.getLib?.() ?? parking._lib ?? "Favorite parking"}</strong><br>
        ${availabilityHTML}
        <button class="navigate-btn" style="margin-top: 8px; width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          🚗 M'y rendre
        </button>
      </div>
    `);
        // Ajouter l'événement pour le bouton "M'y rendre"
        marker.on("popupopen", (e) => {
            if (!e.popup)
                return;
            const popupEl = e.popup.getElement();
            const navBtn = popupEl.querySelector(".navigate-btn");
            if (navBtn) {
                navBtn.addEventListener("click", () => {
                    // Fermer le popup
                    marker.closePopup();
                    // Créer une instance Parking à partir de l'objet
                    const parkingInstance = new Parking(parking._id, parking._lib, new GeoLocation(parking.location.latitude, parking.location.longitude), parking._spots);
                    document.dispatchEvent(new CustomEvent("navigateToParking", { detail: parkingInstance }));
                });
            }
        });
    }
    centerOnUser(position) {
        if (this.map) {
            this.map.setView([position.latitude, position.longitude], this.map.getZoom());
        }
    }
    /**
     * Centre la carte sur l'utilisateur avec un zoom adapté à la navigation
     */
    centerOnUserForNavigation(position) {
        if (this.map) {
            const currentZoom = this.map.getZoom();
            const navigationZoom = Math.max(currentZoom, 16); // Minimum zoom level 16 pour navigation
            this.map.setView([position.latitude, position.longitude], navigationZoom);
        }
    }
    clearRoute() {
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        if (this.nearestParkingMarker) {
            this.map.removeLayer(this.nearestParkingMarker);
            this.nearestParkingMarker = null;
        }
    }
}
