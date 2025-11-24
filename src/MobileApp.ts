import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
import { GeoLocation } from "./modele/GeoLocation.js";

const loader = document.getElementById("loaderContainer") as HTMLElement;

export class MobileApp {
  public userPos: GeoLocation | null = null;
  public nearestParking: any = null;
  private watchId: number | null = null;

  private map: MapView;
  private locCtrl: LocationController;
  private parkCtrl: ParkingController;
  private itineraryCtrl: ItineraryController;

  constructor() {
    this.map = new MapView();
    this.locCtrl = new LocationController();
    this.parkCtrl = new ParkingController();
    this.itineraryCtrl = new ItineraryController();
  }

  async start() {
    loader.style.display = "flex";
    try {
      const userPos = await this.locCtrl.getUserLocation();
      this.userPos = userPos;

      this.map.setUserMarker(userPos);

      const parkings = await this.parkCtrl.getParkings();
      if (!parkings || parkings.length === 0) {
        console.warn("Aucun parking trouvé");
        return;
      }

      this.nearestParking = parkings.reduce((closest, curr) => {
        const distCurr = this.getDistance(userPos, curr.location);
        const distClosest = this.getDistance(userPos, closest.location);
        return distCurr < distClosest ? curr : closest;
      }, parkings[0]);

      for (const p of parkings) {
        this.map.setParkingMarker(p);
      }

      console.log("Application prête. Cliquez sur le bouton pour démarrer le trajet.");
    } catch (err) {
      console.error("Erreur dans start() :", err);
    } finally {
      loader.style.display = "none";
    }
  }

  private getDistance(a: GeoLocation, b: GeoLocation): number {
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

  async showRoute(start: GeoLocation, end: GeoLocation) {
    const route = await this.itineraryCtrl.getItinerary(start, end);
    if (!route?.features?.[0]?.geometry) return null;

    const coordinates = route.features[0].geometry.coordinates;
    this.map.drawRoute(coordinates, start, false);

    const summary = route.features[0].properties.summary;
    const distanceKm = (summary.distance / 1000).toFixed(1);
    const durationStr =
      summary.duration < 3600
        ? `${Math.round(summary.duration / 60)} min`
        : `${Math.floor(summary.duration / 3600)} h ${Math.round((summary.duration % 3600) / 60)} min`;

    return { distanceKm: Number(distanceKm), duration: durationStr };
  }


  public startTracking(): void {
    if (!navigator.geolocation) return;
    if (!this.nearestParking?.location) return;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          this.userPos = new GeoLocation(lat, lon);

          this.map.setUserMarker(this.userPos, true);

          const route = await this.itineraryCtrl.getItinerary(
            this.userPos,
            this.nearestParking.location
          );

          if (route?.features?.[0]?.geometry) {
            const coords = route.features[0].geometry.coordinates;
            this.map.drawRoute(coords, this.userPos, false);

            const summary = route.features[0].properties.summary;
            const distanceKm = (summary.distance / 1000).toFixed(1);
            const durationStr =
              summary.duration < 3600
                ? `${Math.round(summary.duration / 60)} min`
                : `${Math.floor(summary.duration / 3600)} h ${Math.round((summary.duration % 3600) / 60)} min`;

            const routeInfoEl = document.getElementById("routeInfo");
            if (routeInfoEl) routeInfoEl.textContent = `Distance : ${Number(distanceKm)} km | Durée : ${durationStr}`;
          } else {
            const routeInfoEl = document.getElementById("routeInfo");
            if (routeInfoEl) routeInfoEl.textContent = "Itinéraire indisponible";
          }
        } catch (err) {
          console.error("Erreur watchPosition :", err);
        }
      },
      (err) => console.error("Erreur watchPosition :", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }
}
