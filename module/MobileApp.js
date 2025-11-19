import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
const loader = document.getElementById("loaderContainer");
loader.style.display = "hidden";
export class MobileApp {
    constructor() {
        this.map = new MapView();
        this.locCtrl = new LocationController();
        this.parkCtrl = new ParkingController();
        this.itineraryCtrl = new ItineraryController();
    }
    async start() {
        try {
            loader.style.display = "flex";
            const userPos = await this.locCtrl.getUserLocation();
            this.map.setUserMarker(userPos);
            const parkings = await this.parkCtrl.getParkings();
            if (!parkings || parkings.length === 0) {
                console.warn("Aucun parking trouvé");
                return;
            }
            const nearest = parkings.reduce((closest, curr) => {
                const distCurr = this.getDistance(userPos, curr.location);
                const distClosest = this.getDistance(userPos, closest.location);
                return distCurr < distClosest ? curr : closest;
            }, parkings[0]);
            for (const p of parkings) {
                if (p !== nearest) {
                    this.map.setParkingMarker(p);
                }
            }
            this.map.setNearestParkingMarker(nearest);
            await this.showRoute(userPos, nearest.location);
        }
        catch (err) {
            console.error("Erreur lors du démarrage de l'application :", err);
        }
        finally {
            loader.style.display = "none"; // cacher loader
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
        if (!route || !route.features || !route.features[0] || !route.features[0].geometry) {
            console.error("Itinerary response malformée :", route);
            return;
        }
        const coordinates = route.features[0].geometry.coordinates;
        this.map.drawRoute(coordinates);
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
        console.log(`Distance : ${distanceKm} km, Durée : ${durationStr}`);
        return { distanceKm: Number(distanceKm), duration: durationStr };
    }
}
