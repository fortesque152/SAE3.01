import { GeoLocation } from "../modele/GeoLocation.js";
import { Parking } from "../modele/Parking.js";
import type { ParkingObject } from "../types/index.js";

/**
 * Interface Segregation Principle (ISP):
 * Define a focused interface for map display
 */
export interface IMapView {
    setUserMarker(location?: GeoLocation, recenter?: boolean): Promise<void>;
    setParkingMarker(parking: Parking): void;
    setFavoriteParkingMarker(parking: ParkingObject): void;
    drawRoute(coordinates: [number, number][], start: GeoLocation, recenter: boolean): void;
    clearRoute(): void;
    centerOnUser(location: GeoLocation): void;
    centerOnUserForNavigation(location: GeoLocation): void;
    showOnlyParking(parking: Parking): void;
    showAllParkings(): void;
}
