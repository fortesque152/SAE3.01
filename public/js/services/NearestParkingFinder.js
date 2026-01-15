/**
 * Single Responsibility Principle (SRP):
 * Separate parking search logic into its own service
 */
export class NearestParkingFinder {
    constructor(distanceCalculator) {
        this.distanceCalculator = distanceCalculator;
    }
    /**
     * Find the nearest parking from a given location
     */
    find(parkings, userLocation) {
        if (!parkings || parkings.length === 0)
            return null;
        return parkings.reduce((closest, current) => {
            const distCurrent = this.distanceCalculator.calculate(userLocation, current.location);
            const distClosest = this.distanceCalculator.calculate(userLocation, closest.location);
            return distCurrent < distClosest ? current : closest;
        }, parkings[0]);
    }
}
