/// <reference lib="dom" />
import { GeoLocation } from "../modele/GeoLocation.js";
import { ILocationService } from "../interfaces/ILocationService.js";

/**
 * Dependency Inversion Principle (DIP):
 * Implement the ILocationService interface
 * Single Responsibility Principle (SRP):
 * Only responsible for getting user location
 */
export class LocationController implements ILocationService {
  getUserLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("La géolocalisation n'est pas supportée.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos: GeolocationPosition) =>
          resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)),
        (err: GeolocationPositionError) => reject("Erreur géolocalisation : " + err.message)
      );
    });
  }
}
