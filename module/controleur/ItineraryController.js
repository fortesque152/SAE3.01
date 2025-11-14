export class ItineraryController {
    constructor() {
        this.apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ1NWJkNzU1OWM1YzQ4YzQ5YzEzYTBkNTY4ZTY5OWU4IiwiaCI6Im11cm11cjY0In0=";
    }
    async getItinerary(start, end) {
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        return res.json();
    }
}
