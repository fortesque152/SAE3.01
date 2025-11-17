import { LocationController } from "../controleur/LocationController.js";
export class MapView {
    constructor() {
        this.userMarker = null;
        this.userPosition = null;
        // Création de la carte avec coordonnées temporaires
        this.map = L.map('map').setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
        // Centrer la carte sur l'utilisateur au démarrage
        this.initMapCenter();
    }
    // Récupérer la position et centrer la carte
    async initMapCenter() {
        try {
            const locationController = new LocationController();
            this.userPosition = await locationController.getUserLocation();
            // Centrer la carte sur la position réelle
            this.map.setView([this.userPosition.latitude, this.userPosition.longitude], 15);
            // Placer le marker initial
            this.setUserMarker();
        }
        catch (err) {
            console.error("Impossible de récupérer la géolocalisation :", err);
        }
    }
    // Placer le marker utilisateur sans changer la vue
    async setUserMarker(location) {
        if (location)
            this.userPosition = location;
        if (!this.userPosition)
            return;
        if (!this.userMarker) {
            this.userMarker = L.marker([this.userPosition.latitude, this.userPosition.longitude], {
                title: "Votre position"
            }).addTo(this.map);
        }
        else {
            this.userMarker.setLatLng([this.userPosition.latitude, this.userPosition.longitude]);
        }
    }
    setParkingMarker(parking) {
        const marker = L.marker([parking.location.latitude, parking.location.longitude], {
            title: parking.getlib()
        }).addTo(this.map);
        try {
            marker.bindPopup(`<strong>${parking.getlib()}</strong>`);
        }
        catch (e) {
            // Ne pas bloquer si bindPopup n'est pas disponible
            console.warn('Impossible de lier la popup du parking', e);
        }
    }
    drawRoute(polyline) {
        const coords = polyline.map((c) => [c[1], c[0]]);
        L.polyline(coords).addTo(this.map);
    }
}
