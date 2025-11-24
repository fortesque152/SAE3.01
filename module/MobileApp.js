import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
import { GeoLocation } from "./modele/GeoLocation.js";
const loader = document.getElementById("loaderContainer");
export class MobileApp {
    constructor() {
        this.userPos = null;
        this.nearestParking = null;
        this.watchId = null;
        this.lastPos = null;
        this.routeRecalcThresholdMeters = 5;
        this.map = new MapView();
        this.locCtrl = new LocationController();
        this.parkCtrl = new ParkingController();
        this.itineraryCtrl = new ItineraryController();
    }
    async start() {
        loader.style.display = "flex";
        try {
            const userPos = await this.locCtrl.getUserLocation();
            this.userPos = userPos;
            this.map.setUserMarker(userPos);
            const parkings = await this.parkCtrl.getParkings();
            if (!parkings || parkings.length === 0) {
                console.warn("Aucun parking trouvé");
                return;
            }
            this.nearestParking = parkings.reduce((closest, curr) => {
                const distCurr = this.getDistance(userPos, curr.location);
                const distClosest = this.getDistance(userPos, closest.location);
                return distCurr < distClosest ? curr : closest;
            }, parkings[0]);
            for (const p of parkings) {
                if (p !== this.nearestParking)
                    this.map.setParkingMarker(p);
            }
            this.map.setNearestParkingMarker(this.nearestParking);
            // Ne pas démarrer automatiquement le suivi GPS ; attendre l'action de l'utilisateur
        }
        catch (err) {
            console.error("Erreur dans start() :", err);
        }
        finally {
            loader.style.display = "none";
        }
    }
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
    async showRoute(start, end) {
        const route = await this.itineraryCtrl.getItinerary(start, end);
        if (!route || !route.features || !route.features[0]?.geometry) {
            console.error("Itinerary response malformée :", route);
            return null;
        }
        const coordinates = route.features[0].geometry.coordinates;
        this.map.drawRoute(coordinates, start);
        const summary = route.features[0].properties.summary;
        const distanceKm = (summary.distance / 1000).toFixed(1);
        let durationStr;
        if (summary.duration < 3600) {
            const minutes = Math.round(summary.duration / 60);
            durationStr = `${minutes} min`;
        }
        else {
            const hours = Math.floor(summary.duration / 3600);
            const minutes = Math.round((summary.duration % 3600) / 60);
            durationStr = `${hours} h ${minutes} min`;
        }
        return { distanceKm: Number(distanceKm), duration: durationStr };
    }
    startTracking() {
        if (!navigator.geolocation) {
            console.warn("Géolocalisation non disponible");
            return;
        }
        if (!this.nearestParking || !this.nearestParking.location) {
            console.warn("Parking le plus proche introuvable");
            return;
        }
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.watchId = navigator.geolocation.watchPosition(async (pos) => {
            try {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                this.userPos = new GeoLocation(lat, lon);
                this.map.setUserMarker(this.userPos);
                let shouldRecalc = false;
                if (!this.lastPos) {
                    shouldRecalc = true;
                }
                else {
                    const moved = this.getDistance(this.lastPos, this.userPos);
                    if (moved >= this.routeRecalcThresholdMeters)
                        shouldRecalc = true;
                }
                if (shouldRecalc) {
                    const route = await this.itineraryCtrl.getItinerary(this.userPos, this.nearestParking.location);
                    if (route && route.features && route.features[0]?.geometry) {
                        const coordinates = route.features[0].geometry.coordinates;
                        this.map.drawRoute(coordinates, this.userPos);
                        const summary = route.features[0].properties.summary;
                        const distanceKm = (summary.distance / 1000).toFixed(1);
                        let durationStr;
                        if (summary.duration < 3600) {
                            const minutes = Math.round(summary.duration / 60);
                            durationStr = `${minutes} min`;
                        }
                        else {
                            const hours = Math.floor(summary.duration / 3600);
                            const minutes = Math.round((summary.duration % 3600) / 60);
                            durationStr = `${hours} h ${minutes} min`;
                        }
                        const routeInfoEl = document.getElementById("routeInfo");
                        if (routeInfoEl)
                            routeInfoEl.textContent = `${Number(distanceKm)} km • ${durationStr}`;
                        this.lastPos = this.userPos;
                    }
                    else {
                        const routeInfoEl = document.getElementById("routeInfo");
                        if (routeInfoEl)
                            routeInfoEl.textContent = "Itinéraire indisponible";
                    }
                }
            }
            catch (err) {
                console.error("Erreur dans watchPosition :", err);
            }
        }, (err) => {
            console.error("Erreur watchPosition :", err);
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
}
