import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";

export class ParkingController {
  constructor() {
    this.urlMetz =
      "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_lter=id%20is%20not%20null";

    // APIs
    this.overpassUrl = "https://overpass-api.de/api/interpreter";
    this.tflPlaceUrl = "https://api.tfl.gov.uk/Place";

    // 10 km
    this.radiusMeters = 10000;
  }

  async getParkings(user, center) {
    const parkings = [];

    /* ======================
       PARKINGS DE METZ
    ====================== */
    const resMetz = await fetch(this.urlMetz);
    const dataMetz = await resMetz.json();

    if (dataMetz.features) {
      dataMetz.features.forEach((p) => {
        const id = `metz-${p.properties.id || p.id}`;
        const name = p.properties.lib || "Parking Metz";
        const capacity = p.properties.capacite || 0;
        const [lon, lat] = p.geometry.coordinates;
        const location = new GeoLocation(lat, lon);
        parkings.push(new Parking(id, name, location, capacity));
      });
    }

    // Point de référence pour les requêtes “autour de l'utilisateur”
    const ref = center ?? new GeoLocation(49.1193, 6.1757); // fallback: Metz

    /* ======================
       PARKINGS (FRANCE / OSM)
       OpenStreetMap via Overpass — rayon 10 km autour de ref.
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });
      const dataOSM = await resOSM.json();

      if (dataOSM?.elements) {
        dataOSM.elements.forEach((el) => {
          const tags = el.tags ?? {};
          const name = tags.name || "Parking";
          const capacity = Number.parseInt(tags.capacity) || 0;

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
       TfL Unified API — CarPark.
    ====================== */
    try {
      const londonCenter = new GeoLocation(51.5074, -0.1278);
      const distanceToLondon = this.haversineMeters(ref, londonCenter);
      const tflCenter = distanceToLondon < 80000 ? ref : londonCenter;

      const tflUrl = new URL(this.tflPlaceUrl);
      tflUrl.searchParams.set("lat", String(tflCenter.latitude));
      tflUrl.searchParams.set("lon", String(tflCenter.longitude));
      tflUrl.searchParams.set("radius", String(this.radiusMeters));
      tflUrl.searchParams.set("placeTypes", "CarPark");

      const resTfl = await fetch(tflUrl.toString());
      const dataTfl = await resTfl.json();

      if (Array.isArray(dataTfl)) {
        dataTfl.forEach((p) => {
          const lat = p.lat;
          const lon = p.lon;
          if (typeof lat !== "number" || typeof lon !== "number") return;

          const id = `tfl-${p.id || (p.commonName ?? "carpark")}`;
          const name = p.commonName || "Car Park";
          parkings.push(new Parking(id, name, new GeoLocation(lat, lon), 0));
        });
      }
    } catch (e) {
      console.warn("TfL indisponible :", e);
    }

    return parkings;
  }

  haversineMeters(a, b) {
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
