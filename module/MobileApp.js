import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
import { GeoLocation } from "./modele/GeoLocation.js";
const loader = document.getElementById("loaderContainer");
export class MobileApp {
    constructor(user) {
        this.userPos = null;
        this.nearestParking = null;
        this.watchId = null;
        this.lastPos = null;
        this.routeRecalcThresholdMeters = 5;
        this.map = new MapView();
        this.locCtrl = new LocationController();
        this.parkCtrl = new ParkingController();
        this.itineraryCtrl = new ItineraryController();
        this.user = user;
    }
    /** Démarre l'application, récupère la position et les parkings filtrés */
    async start() {
        loader.style.display = "flex";
        try {
            const userPos = await this.locCtrl.getUserLocation();
            this.userPos = userPos;
            this.map.setUserMarker(userPos);
            // Récupère les parkings filtrés selon le profil utilisateur
            const parkings = await this.parkCtrl.getParkings(this.user, userPos);
            if (!parkings || parkings.length === 0) {
                console.warn("Aucun parking trouvé");
                return;
            }
            // Cherche le parking le plus proche
            this.nearestParking = parkings.reduce((closest, curr) => {
                const distCurr = this.getDistance(userPos, curr.location);
                const distClosest = this.getDistance(userPos, closest.location);
                return distCurr < distClosest ? curr : closest;
            }, parkings[0]);
            // Affiche tous les parkings sur la carte
            for (const p of parkings) {
                this.map.setParkingMarker(p);
            }
            console.log("Application prête. Cliquez sur le bouton pour démarrer le trajet.");
        }
        catch (err) {
            console.error("Erreur dans start() :", err);
        }
        finally {
            loader.style.display = "none";
        }
    }
    /** Calcule la distance entre deux points GPS en mètres */
    getDistance(a, b) {
        const R = 6371e3;
        const φ1 = (a.latitude * Math.PI) / 180;
        const φ2 = (b.latitude * Math.PI) / 180;
        const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
        const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
        const x = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
    /** Affiche l'itinéraire entre deux points */
    async showRoute(start, end) {
        const route = await this.itineraryCtrl.getItinerary(start, end);
        if (!route?.features?.[0]?.geometry)
            return null;
        const coordinates = route.features[0].geometry.coordinates;
        this.map.drawRoute(coordinates, start, false);
        const summary = route.features[0].properties.summary;
        const distanceKm = (summary.distance / 1000).toFixed(1);
        const durationStr = summary.duration < 3600
            ? `${Math.round(summary.duration / 60)} min`
            : `${Math.floor(summary.duration / 3600)} h ${Math.round((summary.duration % 3600) / 60)} min`;
        return { distanceKm: Number(distanceKm), duration: durationStr };
    }
    /** Suivi en temps réel de l'utilisateur vers le parking le plus proche */
    startTracking() {
        if (!navigator.geolocation || !this.nearestParking?.location)
            return;
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.watchId = navigator.geolocation.watchPosition(async (pos) => {
            try {
                this.userPos = new GeoLocation(pos.coords.latitude, pos.coords.longitude);
                this.map.setUserMarker(this.userPos, true);
                const route = await this.itineraryCtrl.getItinerary(this.userPos, this.nearestParking.location);
                const routeInfoEl = document.getElementById("routeInfo");
                if (route?.features?.[0]?.geometry) {
                    const coords = route.features[0].geometry.coordinates;
                    this.map.drawRoute(coords, this.userPos, false);
                    const summary = route.features[0].properties.summary;
                    const distanceKm = (summary.distance / 1000).toFixed(1);
                    const durationStr = summary.duration < 3600
                        ? `${Math.round(summary.duration / 60)} min`
                        : `${Math.floor(summary.duration / 3600)} h ${Math.round((summary.duration % 3600) / 60)} min`;
                    if (routeInfoEl)
                        routeInfoEl.textContent = `Distance : ${Number(distanceKm)} km | Durée : ${durationStr}`;
                }
                else {
                    if (routeInfoEl)
                        routeInfoEl.textContent = "Itinéraire indisponible";
                }
            }
            catch (err) {
                console.error("Erreur watchPosition :", err);
            }
        }, (err) => console.error("Erreur watchPosition :", err), { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
}
