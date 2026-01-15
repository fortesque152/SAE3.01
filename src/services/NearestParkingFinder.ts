import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { DistanceCalculator } from "./DistanceCalculator.js";

/**
 * Single Responsibility Principle (SRP):
 * Separate parking search logic into its own service
 */
export class NearestParkingFinder {
    constructor(private distanceCalculator: DistanceCalculator) { }

    /**
     * Find the nearest parking from a given location
     */
    find(parkings: Parking[], userLocation: GeoLocation): Parking | null {
        if (!parkings || parkings.length === 0) return null;

        return parkings.reduce((closest, current) => {
            const distCurrent = this.distanceCalculator.calculate(
                userLocation,
                current.location
            );
            const distClosest = this.distanceCalculator.calculate(
                userLocation,
                closest.location
            );
            return distCurrent < distClosest ? current : closest;
        }, parkings[0]);
    }
}
