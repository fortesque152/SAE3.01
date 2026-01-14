import { LocationController } from "../controleur/LocationController.js";
export class MapView {
    constructor() {
        this.userMarker = null;
        this.userPosition = null;
        this.routeLayer = null;
        this.parkingMarkers = new Map();
        this.nearestParkingMarker = null;
        // Markers storage for navigation mode
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
            const locationController = new LocationController();
            this.userPosition = await locationController.getUserLocation();
            this.map.setView([this.userPosition.latitude, this.userPosition.longitude], 15);
            this.setUserMarker();
        }
        catch (err) {
            console.error("Impossible de récupérer la géolocalisation :", err);
        }
    }
    async setUserMarker(location, recenter = true) {
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
            this.userMarker.bindPopup(`<strong>Votre position</strong><br>`);
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
    }
    setParkingMarker(parking) {
        const marker = L.marker([
            parking.location.latitude,
            parking.location.longitude,
        ]).addTo(this.map);
        const id = parking?._id ?? parking?.id ?? parking?.getId?.() ?? parking?.getid?.();
        if (id)
            this.parkingMarkers.set(String(id), marker);
        marker.bindPopup(`
    <div class="popup-parking">
      <strong>${parking.getlib()}</strong><br>
      <button class="add-fav-btn">
        ⭐ Ajouter aux favoris
      </button>
    </div>
  `);
        // Event existant (tu le gardes)
        marker.on("click", () => {
            document.dispatchEvent(new CustomEvent("parkingSelected", { detail: parking }));
        });
        // IMPORTANT : récupération correcte du bouton
        marker.on("popupopen", (e) => {
            const popupEl = e.popup.getElement();
            const btn = popupEl.querySelector(".add-fav-btn");
            if (!btn)
                return;
            btn.addEventListener("click", async () => {
                try {
                    const res = await fetch("./vue/add_favorite.php", {
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
        const targetId = parking?._id ?? parking?.id ?? parking?.getId?.() ?? parking?.getid?.();
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
        // Ne fitBounds que si demandé
        if (fitBounds && this.routeLayer && !this.routeLayer.hasFitBounds) {
            this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
            this.routeLayer.hasFitBounds = true;
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
        const id = parking._id ?? parking.id ?? parking.getId?.() ?? parking.getid?.();
        if (id)
            this.parkingMarkers.set(id, marker);
        marker.bindPopup(`<strong>⭐ ${parking.getLib?.() ?? parking._lib ?? "Favorite parking"}</strong>`);
    }
    centerOnUser(position) {
        if (this.map) {
            this.map.setView([position.latitude, position.longitude], this.map.getZoom());
        }
    }
}
