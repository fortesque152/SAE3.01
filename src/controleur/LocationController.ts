import { GeoLocation } from "../modele/GeoLocation.js";

export class LocationController {
    async getUserLocation(): Promise<GeoLocation> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("La géolocalisation n'est pas supportée.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)),
                (err) => reject("Erreur géolocalisation : " + err.message)
            );
        });
    }
}