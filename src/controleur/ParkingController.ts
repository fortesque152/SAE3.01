import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { UserProfile } from "../modele/UserProfile.js";

export class ParkingController {
  private overpassUrls = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  private urlLondres = "api/londre/Parking_Bays_20260109.geojson";
  private radiusMeters = 10_000;

  async getParkings(
    user: UserProfile,
    center?: GeoLocation
  ): Promise<Parking[]> {
    const parkings: Parking[] = [];

    const ref = center ?? new GeoLocation(49.1193, 6.1757);

    /* ======================
        PARKINGS FRANCE (OSM)
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

      let dataOSM: any = null;

      for (const url of this.overpassUrls) {
        try {
          const resOSM = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({ data: overpassQuery }).toString(),
          });

          if (!resOSM.ok) {
            console.warn("Overpass indisponible :", resOSM.status, url);
            continue;
          }

          dataOSM = JSON.parse(await resOSM.text());
          break;
        } catch (e) {
          console.warn("Échec Overpass sur", url, e);
        }
      }

      if (dataOSM?.elements) {
        dataOSM.elements.forEach((el: any) => {
          const tags = el.tags ?? {};
          const name = tags.name || "Parking";
          const capacity = parseInt(tags.capacity) || 0;

          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (typeof lat !== "number" || typeof lon !== "number") return;

          const id = `osm-${el.type}-${el.id}`;
          parkings.push(
            new Parking(id, name, new GeoLocation(lat, lon), capacity)
          );
        });
      }
    } catch (e) {
      console.warn("Overpass (OSM) indisponible :", e);
    }

    /* ======================
        PARKINGS DE LONDRES
       ====================== */
    try {
      const resLondres = await fetch(this.urlLondres);

      if (!resLondres.ok) {
        console.warn(
          "Fichier Londres introuvable :",
          resLondres.status,
          this.urlLondres
        );
        return parkings;
      }

      const dataLondres = await resLondres.json();

      if (dataLondres?.features) {
        dataLondres.features.forEach((p: any) => {
          if (!user.canPark(p.properties)) return;

          const id = `londres-${p.properties.unique_identifier || p.id}`;
          const name =
            `${p.properties.road_name || "Unknown Road"} - ` +
            `${p.properties.restriction_type || "Parking"}`;

          const capacity = parseInt(p.properties.parking_spaces) || 1;
          const [lon, lat] = p.geometry.coordinates;

          parkings.push(
            new Parking(id, name, new GeoLocation(lat, lon), capacity)
          );
        });
      }
    } catch (e) {
      console.warn("Erreur chargement parkings Londres :", e);
    }

    return parkings;
  }
}
