import { GeoLocation } from "../modele/GeoLocation.js";
import { Parking } from "../modele/Parking.js";
import { LocationController } from "../controleur/LocationController.js";

declare const L: any;

export class MapView {
  private map: any;
  private userMarker: any = null;
  private userPosition: GeoLocation | null = null;
  private routeLayer: any = null;

  constructor() {
    this.map = L.map("map").setView([49.11875, 6.17460], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      noWrap: true,
    }).addTo(this.map);

    this.initMapCenter();
  }

  private async initMapCenter() {
    try {
      const locationController = new LocationController();
      this.userPosition = await locationController.getUserLocation();

      this.map.setView(
        [this.userPosition.latitude, this.userPosition.longitude],
        15
      );

      this.setUserMarker();
    } catch (err) {
      console.error("Impossible de récupérer la géolocalisation :", err);
    }
  }

  async setUserMarker(location?: GeoLocation, recenter: boolean = true) {
    const userIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (location) this.userPosition = location;
    if (!this.userPosition) return;

    if (!this.userMarker) {
      this.userMarker = L.marker(
        [this.userPosition.latitude, this.userPosition.longitude],
        { title: "Votre position", icon: userIcon }
      ).addTo(this.map);
      this.userMarker.bindPopup(`<strong>Votre position</strong><br>`);
    } else {
      this.userMarker.setLatLng([
        this.userPosition.latitude,
        this.userPosition.longitude,
      ]);
    }

    if (recenter) {
      this.centerOnUser(this.userPosition);
    }
  }

  setParkingMarker(parking: Parking) {
    const marker = L.marker([parking.location.latitude, parking.location.longitude], {
      title: parking.getlib(),
    }).addTo(this.map);
    marker.bindPopup(`<strong>${parking.getlib()}</strong>`);
  }

  setNearestParkingMarker(parking: Parking) {
    const iconP = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const marker = L.marker([parking.location.latitude, parking.location.longitude], {
      title: "Parking le plus proche",
      icon: iconP,
    }).addTo(this.map);
    marker.bindPopup(`<strong>Parking le plus proche</strong><br>${parking.getlib()}`);
  }

  drawRoute(polyline: any, currentPos?: GeoLocation, fitBounds: boolean = true) {
    if (!polyline || !Array.isArray(polyline) || polyline.length === 0) return;

    const coords = polyline.map((c: any) => [c[1], c[0]]);
    if (currentPos) coords.unshift([currentPos.latitude, currentPos.longitude]);

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }

    this.routeLayer = L.polyline(coords, { color: "blue", weight: 4, opacity: 0.8 }).addTo(this.map);

    // Ne fitBounds que si demandé
    if (fitBounds && this.routeLayer && !this.routeLayer.hasFitBounds) {
      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
      (this.routeLayer as any).hasFitBounds = true;
    }
  }

  public centerOnUser(position: GeoLocation) {
    if (this.map) {
      this.map.setView([position.latitude, position.longitude], this.map.getZoom());
    }
  }
}
