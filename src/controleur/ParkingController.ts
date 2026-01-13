import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { UserProfile } from "../modele/UserProfile.js";

export class ParkingController {

    private urlMetz = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_lter=id%20is%20not%20null";


    private overpassUrl = "https://overpass-api.de/api/interpreter";
    private tflPlaceUrl = "https://api.tfl.gov.uk/Place";

    private radiusMeters = 10_000;

    async getParkings(user: UserProfile, center?: GeoLocation): Promise<Parking[]> {
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

        const ref = center ?? new GeoLocation(49.1193, 6.1757); 

        /* ======================
           PARKINGS FRANCE
        ====================== */
        try {
            const overpassQuery = `
[out:json][timeout:25];
(
  node["amenity"="parking"](around:${this.radiusMeters},${ref.latitude},${ref.longitude});
  way["amenity"="parking"](around:${this.radiusMeters},${ref.latitude},${ref.longitude});
  relation["amenity"="parking"](around:${this.radiusMeters},${ref.latitude},${ref.longitude});
);
out center 500;
`;

            const resOSM = await fetch(this.overpassUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: new URLSearchParams({ data: overpassQuery }).toString(),
            });
            const dataOSM = await resOSM.json();

            if (dataOSM?.elements) {
                dataOSM.elements.forEach((el: any) => {
                    const tags = el.tags ?? {};
                    const name = tags.name || "Parking";
                    const capacity = Number.parseInt(tags.capacity) || 0;

                    // Overpass renvoie soit lat/lon (node), soit center.{lat,lon} (way/relation)
                    const lat = el.lat ?? el.center?.lat;
                    const lon = el.lon ?? el.center?.lon;
                    if (typeof lat !== "number" || typeof lon !== "number") return;

                    const id = `osm-${el.type}-${el.id}`;
                    parkings.push(new Parking(id, name, new GeoLocation(lat, lon), capacity));
                });
            }
        } catch (e) {
            console.warn("Overpass (OSM) indisponible :", e);
        }

        /* ======================
           PARKINGS DE LONDRES
        ====================== */
        try {
            // Si l'utilisateur est très loin de Londres, on prend un centre fixe (évite un résultat vide inutile)
            const londonCenter = new GeoLocation(51.5074, -0.1278);
            const distanceToLondon = this.haversineMeters(ref, londonCenter);
            const tflCenter = distanceToLondon < 80_000 ? ref : londonCenter;

            const tflUrl = new URL(this.tflPlaceUrl);
            tflUrl.searchParams.set("lat", String(tflCenter.latitude));
            tflUrl.searchParams.set("lon", String(tflCenter.longitude));
            tflUrl.searchParams.set("radius", String(this.radiusMeters));
            tflUrl.searchParams.set("placeTypes", "CarPark");

            const resTfl = await fetch(tflUrl.toString());
            const dataTfl = await resTfl.json();

            // Réponse attendue: tableau de places
            if (Array.isArray(dataTfl)) {
                dataTfl.forEach((p: any) => {
                    const lat = p.lat;
                    const lon = p.lon;
                    if (typeof lat !== "number" || typeof lon !== "number") return;

                    const id = `tfl-${p.id || (p.commonName ?? "carpark")}`;
                    const name = p.commonName || "Car Park";
                    const capacity = 0;
                    parkings.push(new Parking(id, name, new GeoLocation(lat, lon), capacity));
                });
            }
        } catch (e) {
            console.warn("TfL indisponible :", e);
        }

        return parkings;
    }

    private haversineMeters(a: GeoLocation, b: GeoLocation): number {
        const R = 6371e3;
        const φ1 = (a.latitude * Math.PI) / 180;
        const φ2 = (b.latitude * Math.PI) / 180;
        const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
        const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
        const x =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
}
