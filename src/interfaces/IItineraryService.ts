import { GeoLocation } from "../modele/GeoLocation.js";
import { Itinerary } from "../modele/Itinerary.js";

/**
 * Interface Segregation Principle (ISP):
 * Define a focused interface for itinerary services
 */
export interface IItineraryService {
    getItinerary(start: GeoLocation, end: GeoLocation): Promise<Itinerary>;
}
