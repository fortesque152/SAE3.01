import { GeoLocation } from "../modele/GeoLocation.js";

/**
 * Single Responsibility Principle (SRP):
 * Separate distance calculation into its own service
 */
export class DistanceCalculator {
    /**
     * Calculate distance between two GPS points in meters using Haversine formula
     */
    calculate(a: GeoLocation, b: GeoLocation): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (a.latitude * Math.PI) / 180;
        const φ2 = (b.latitude * Math.PI) / 180;
        const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
        const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;

        const x =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
}
