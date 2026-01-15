import { GeoLocation } from "../modele/GeoLocation.js";
import { Itinerary } from "../modele/Itinerary.js";
import { NavigationInstruction } from "../modele/NavigationInstruction.js";
import { IItineraryService } from "../interfaces/IItineraryService.js";

/**
 * Dependency Inversion Principle (DIP):
 * Implement the IItineraryService interface
 * Single Responsibility Principle (SRP):
 * Only responsible for fetching itinerary data from external routing service
 */
export class ItineraryController implements IItineraryService {
    // ORS key kept for reference (not used anymore on devweb due to server restrictions)
    private apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyND...";

    /**
     * Get an itinerary between two points.
     *
     * IMPORTANT: On devweb (IUT), proxying to OpenRouteService is blocked (HTTP 403).
     * We therefore use OSRM public routing (GET) which works directly from the browser.
     * This method returns an Itinerary object following SOLID principles.
     */
    async getItinerary(start: GeoLocation, end: GeoLocation): Promise<Itinerary> {
        const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
            "?overview=full&geometries=geojson&steps=true";

        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Itinerary API error ${res.status}: ${text}`);
        }

        const data = await res.json();

        const route = data?.routes?.[0];
        if (!route?.geometry?.coordinates) {
            throw new Error("Itinerary API error: invalid response");
        }

        // Extraire les instructions de navigation
        const instructions: NavigationInstruction[] = [];

        if (route.legs && route.legs.length > 0) {
            for (const leg of route.legs) {
                if (leg.steps) {
                    for (const step of leg.steps) {
                        const maneuver = step.maneuver;
                        const type = maneuver.type || "continue";
                        const modifier = maneuver.modifier || "";
                        const streetName = step.name || "";
                        const distance = step.distance || 0;
                        const location: [number, number] = maneuver.location || [0, 0];

                        instructions.push(
                            new NavigationInstruction(
                                type,
                                modifier,
                                streetName,
                                distance,
                                location
                            )
                        );
                    }
                }
            }
        }

        // Convert OSRM response to Itinerary object
        return new Itinerary(
            route.geometry.coordinates,
            route.distance,
            route.duration,
            instructions
        );
    }
}
