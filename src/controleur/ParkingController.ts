import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { UserProfile } from "../modele/UserProfile.js";

export class ParkingController {

    private urlMetz = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_lter=id%20is%20not%20null";
    private urlLondres = "./api/Londre/Parking_Bays_20260109.geojson"
    async getParkings(user: UserProfile): Promise<Parking[]> {
        const parkings: Parking[] = [];

        /* ======================
           PARKINGS DE METZ
        ====================== */
        const resMetz = await fetch(this.urlMetz);
        const dataMetz = await resMetz.json();

        if (dataMetz.features) {
            dataMetz.features.forEach((p: any) => {
                const id = `metz-${p.properties.id || p.id}`;
                const name = p.properties.lib || "Parking Metz";
                const capacity = p.properties.capacite || 0;
                const [lon, lat] = p.geometry.coordinates;
                const location = new GeoLocation(lat, lon);

                // Ici on suppose que Metz n'a pas de restrictions pour le type de véhicule
                parkings.push(new Parking(id, name, location, capacity));
            });
        }

        /* ======================
           PARKINGS DE LONDRES
        ====================== */
        const resLondres = await fetch(this.urlLondres);
        const dataLondres = await resLondres.json();

        if (dataLondres.features) {
            dataLondres.features.forEach((p: any) => {
                // Vérifie si l'utilisateur peut se garer ici
                if (!user.canPark(p.properties)) return;

                const id = `londres-${p.properties.unique_identifier || p.id}`;
                const name = `${p.properties.road_name || "Unknown Road"} - ${p.properties.restriction_type || "Parking"}`;
                const capacity = parseInt(p.properties.parking_spaces) || 1;
                const [lon, lat] = p.geometry.coordinates;
                const location = new GeoLocation(lat, lon);

                parkings.push(new Parking(id, name, location, capacity));
            });
        }

        return parkings;
    }
}
