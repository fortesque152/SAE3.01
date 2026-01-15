import { GeoLocation } from "../modele/GeoLocation.js";

/**
 * Interface Segregation Principle (ISP):
 * Define a focused interface for location services
 */
export interface ILocationService {
    getUserLocation(): Promise<GeoLocation>;
}
