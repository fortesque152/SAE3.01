import { GeoLocation } from "../modele/GeoLocation.js";
import { Parking } from "../modele/Parking.js";
import { LocationController } from "../controleur/LocationController.js";

declare const L: any;

export class MapView {
    private map: any;
    private userMarker: any = null;
    private userPosition: GeoLocation | null = null;

    constructor() {
        // Création de la carte avec coordonnées temporaires
        this.map = L.map('map').setView([0, 0], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Centrer la carte sur l'utilisateur au démarrage
        this.initMapCenter();
    }

    // Récupérer la position et centrer la carte
    private async initMapCenter() {
        try {
            const locationController = new LocationController();
            this.userPosition = await locationController.getUserLocation();

            // Centrer la carte sur la position réelle
            this.map.setView([this.userPosition.latitude, this.userPosition.longitude], 15);

            // Placer le marker initial
            this.setUserMarker();

        } catch (err) {
            console.error("Impossible de récupérer la géolocalisation :", err);
        }
    }

    // Placer le marker utilisateur sans changer la vue
    async setUserMarker(location?: GeoLocation) {
        const userIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        if (location) this.userPosition = location;
        if (!this.userPosition) return;

        if (!this.userMarker) {
            this.userMarker = L.marker([this.userPosition.latitude, this.userPosition.longitude], {
                title: "Votre position",
                icon: userIcon
            }).addTo(this.map);
        } else {
            this.userMarker.setLatLng([this.userPosition.latitude, this.userPosition.longitude]);
        }
    }

    setParkingMarker(parking: Parking) {
        const marker = L.marker([parking.location.latitude, parking.location.longitude], {
            title: parking.getlib()
        }).addTo(this.map);
        try {
            marker.bindPopup(`<strong>${parking.getlib()}</strong>`);
        } catch (e) {
            // Ne pas bloquer si bindPopup n'est pas disponible
            console.warn('Impossible de lier la popup du parking', e);
        }
    }
    
    setNearestParkingMarker(parking: Parking) {
        const iconP = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.marker([parking.location.latitude, parking.location.longitude], {
            title: "Parking le plus proche",
            icon: iconP
        }).addTo(this.map);
    }

    drawRoute(polyline: any) {
        const coords = polyline.map((c: any) => [c[1], c[0]]);
        L.polyline(coords).addTo(this.map);
    }


}
