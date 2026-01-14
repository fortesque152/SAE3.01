export class ItineraryController {
    constructor() {
        // ORS key kept for reference (not used anymore on devweb due to server restrictions)
        this.apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyND...";
    }
    /**
     * Get an itinerary between two points.
     *
     * IMPORTANT: On devweb (IUT), proxying to OpenRouteService is blocked (HTTP 403).
     * We therefore use OSRM public routing (GET) which works directly from the browser.
     * This method returns an ORS-like GeoJSON FeatureCollection so the rest of the app
     * (MapView + MobileApp) does not need to change.
     */
    async getItinerary(start, end) {
        const url = "https://router.project-osrm.org/route/v1/driving/" +
            `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
            "?overview=full&geometries=geojson";
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
        // Convert OSRM response to the ORS-like shape expected by MobileApp.showRoute()
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: route.geometry,
                    properties: {
                        summary: {
                            distance: route.distance, // meters
                            duration: route.duration, // seconds
                        },
                    },
                },
            ],
        };
    }
}
