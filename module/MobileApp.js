import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
import { UserProfile } from "./modele/UserProfile.js";
export class MobileApp {
    constructor() {
        this.user = new UserProfile("user-name", "user-surname");
        this.map = new MapView();
        this.locCtrl = new LocationController();
        this.parkCtrl = new ParkingController();
        this.itineraryCtrl = new ItineraryController();
    }
    async start() {
        const userPos = await this.locCtrl.getUserLocation();
        // passer la position utilisateur au MapView
        this.map.setUserMarker(userPos);
        const parkings = await this.parkCtrl.getParkings();
        if (!parkings || parkings.length === 0) {
            console.warn("Aucun parking trouvé");
            return;
        }
        for (const p of parkings) {
            this.map.setParkingMarker(p);
        }
        const nearest = parkings.reduce((closest, curr) => {
            const distCurr = this.getDistance(userPos, curr.location);
            const distClosest = this.getDistance(userPos, closest.location);
            return distCurr < distClosest ? curr : closest;
        }, parkings[0]);
        // mettre en évidence le plus proche (si MapView a une méthode dédiée, utilisez-la)
        this.map.setParkingMarker(nearest);
        try {
            const route = await this.itineraryCtrl.getItinerary(userPos, nearest.location);
            const geometry = route?.features?.[0]?.geometry?.coordinates;
            if (!geometry) {
                console.warn("Itinéraire sans géométrie");
                return;
            }
            this.map.drawRoute(geometry);
        }
        catch (err) {
            console.error("Erreur lors de la récupération de l'itinéraire :", err);
        }
    }
    getDistance(a, b) {
        const R = 6371e3;
        const φ1 = a.latitude * Math.PI / 180;
        const φ2 = b.latitude * Math.PI / 180;
        const Δφ = (b.latitude - a.latitude) * Math.PI / 180;
        const Δλ = (b.longitude - a.longitude) * Math.PI / 180;
        const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
}
