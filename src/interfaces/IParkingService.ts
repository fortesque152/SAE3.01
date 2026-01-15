import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { UserProfile } from "../modele/UserProfile.js";

/**
 * Interface Segregation Principle (ISP):
 * Define a focused interface for parking services
 */
export interface IParkingService {
    getParkings(user: UserProfile, center?: GeoLocation): Promise<Parking[]>;
}
