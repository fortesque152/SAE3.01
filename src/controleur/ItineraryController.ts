import { GeoLocation } from "../modele/GeoLocation.js";

export class ItineraryController {
    private apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ1NWJkNzU1OWM1YzQ4YzQ5YzEzYTBkNTY4ZTY5OWU4IiwiaCI6Im11cm11cjY0In0=";


    async getItinerary(start: GeoLocation, end: GeoLocation): Promise<any> {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car`;


        const body = {
            coordinates: [
                [start.longitude, start.latitude],
                [end.longitude, end.latitude]
            ]
        };


        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": this.apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            // Fournir un message d'erreur plus explicite pour le debug côté client
            const text = await res.text();
            throw new Error(`Itinerary API error ${res.status}: ${text}`);
        }

        return res.json();
    }
}