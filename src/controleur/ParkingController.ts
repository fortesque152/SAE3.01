import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";

export class ParkingController {
    private url = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_lter=id%20is%20not%20null";

    async getParkings(): Promise<Parking[]> {
        const res = await fetch(this.url);
        const data = await res.json();

        if (!data.features) return [];

        return data.features.map((p: any) => {
            const id = p.properties.id || p.id;
            const name = p.properties.lib || "Nom inconnue";
            const capacity = p.properties.capacite || 0;

            const [lon, lat] = p.geometry.coordinates;
            const location = new GeoLocation(lat, lon);

            return new Parking(id, name, location, capacity);
        });
    }


    
}
