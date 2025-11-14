import { GeoLocation } from "../modele/GeoLocation.ts";

export class LocationController {
    getUserLocation(): Promise<GeoLocation> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)),
                err => reject(err)
            );
        });
    }
}