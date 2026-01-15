/// <reference lib="dom" />
import { GeoLocation } from "../modele/GeoLocation.js";
/**
 * Dependency Inversion Principle (DIP):
 * Implement the ILocationService interface
 * Single Responsibility Principle (SRP):
 * Only responsible for getting user location
 */
export class LocationController {
    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("La géolocalisation n'est pas supportée.");
                return;
            }
            navigator.geolocation.getCurrentPosition((pos) => resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)), (err) => reject("Erreur géolocalisation : " + err.message));
        });
    }
}
