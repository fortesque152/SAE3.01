import { Parking } from "../modele/Parking.js";
import { GeoLocation } from "../modele/GeoLocation.js";
import { UserProfile } from "../modele/UserProfile.js";
import { IParkingService } from "../interfaces/IParkingService.js";

/**
 * Dependency Inversion Principle (DIP):
 * Implement the IParkingService interface
 * Single Responsibility Principle (SRP):
 * Only responsible for fetching parking data from external sources
 */
export class ParkingController implements IParkingService {
  private overpassUrls = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  private urlLondres = "../data/londres/Parking_Bays_20260109.geojson";
  private urlMetz = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_filter=id%20is%20not%20null";
  private radiusMeters = 10_000;

  async getParkings(
    _user: UserProfile,
    center?: GeoLocation
  ): Promise<Parking[]> {
    const parkings: Parking[] = [];

    const ref = center ?? new GeoLocation(49.1193, 6.1757);

    /* ======================
        PARKINGS METZ (Temps Réel)
       ====================== */
    try {
      const resMetz = await fetch(this.urlMetz);

      if (!resMetz.ok) {
        console.warn("API Metz indisponible :", resMetz.status);
      } else {
        const dataMetz = await resMetz.json() as {
          features?: Array<{
            properties: {
              id: string;
              lib: string;
              place_total: number | null;
              place_libre: number | null;
              cout: string;
            };
            geometry: {
              coordinates: [number, number];
            };
          }>;
        };

        if (dataMetz?.features) {
          dataMetz.features.forEach((feature) => {
            const props = feature.properties;
            const [lon, lat] = feature.geometry.coordinates;

            const id = `metz-${props.id}`;
            const name = props.lib || "Parking";
            const capacity = props.place_total || 0;

            const parking = new Parking(id, name, new GeoLocation(lat, lon), capacity);

            // Stocker les places disponibles et total SEULEMENT si la donnée existe et n'est pas null
            if (props.place_libre !== null && props.place_libre !== undefined) {
              (parking as any).availableSpots = props.place_libre;
            }
            if (props.place_total !== null && props.place_total !== undefined) {
              (parking as any).totalSpots = props.place_total;
            }

            parkings.push(parking);
          });
        }
      }
    } catch (e) {
      console.warn("Erreur chargement parkings Metz :", e);
    }

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

      let dataOSM: { elements?: Array<{ type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> } | null = null;

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
        dataOSM.elements.forEach((el) => {
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

      const dataLondres = await resLondres.json() as {
        features?: Array<{
          geometry?: { coordinates?: [number, number] };
          properties?: {
            BayID?: string;
            StreetName?: string;
            unique_identifier?: string;
            id?: string;
            road_name?: string;
            restriction_type?: string;
            parking_spaces?: string | number;
          };
        }>;
      };

      if (dataLondres?.features) {
        dataLondres.features.forEach((p) => {
          const props = p.properties;
          const coords = p.geometry?.coordinates;
          if (!props || !coords) return;

          const [lon, lat] = coords;

          // Filtrer par distance (même rayon que pour OSM)
          const parkingLoc = new GeoLocation(lat, lon);
          const distance = this.haversineDistance(ref, parkingLoc);
          if (distance > this.radiusMeters) return; // Ignorer si trop loin

          const id = `londres-${props.unique_identifier || props.id || ''}`;
          const name =
            `${props.road_name || "Unknown Road"} - ` +
            `${props.restriction_type || "Parking"}`;

          const capacity = parseInt(String(props.parking_spaces)) || 1;

          parkings.push(
            new Parking(id, name, parkingLoc, capacity)
          );
        });
      }
    } catch (e) {
      console.warn("Erreur chargement parkings Londres :", e);
    }

    return parkings;
  }

  /**
   * Calcule la distance en mètres entre deux points géographiques
   * Formule de Haversine
   */
  private haversineDistance(a: GeoLocation, b: GeoLocation): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;

    const sinΔφ = Math.sin(Δφ / 2);
    const sinΔλ = Math.sin(Δλ / 2);

    const x = sinΔφ ** 2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ ** 2;

    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
}
