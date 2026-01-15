/// <reference lib="dom" />

import { ILocationService } from "./interfaces/ILocationService.js";
import { IParkingService } from "./interfaces/IParkingService.js";
import { IItineraryService } from "./interfaces/IItineraryService.js";
import { IMapView } from "./interfaces/IMapView.js";
import { GeoLocation } from "./modele/GeoLocation.js";
import { UserProfile } from "./modele/UserProfile.js";
import { Parking } from "./modele/Parking.js";
import { DistanceCalculator } from "./services/DistanceCalculator.js";
import { NearestParkingFinder } from "./services/NearestParkingFinder.js";
import { RouteFormatter } from "./services/RouteFormatter.js";
import { NavigationService } from "./services/NavigationService.js";
import { NavigationUI } from "./ui/NavigationUI.js";
import type { ParkingObject } from "./types/index.js";
const loader = document.getElementById("loaderContainer") as HTMLElement;

/**
 * Dependency Inversion Principle (DIP):
 * Depend on abstractions (interfaces) rather than concrete implementations
 * Single Responsibility Principle (SRP):
 * Orchestrates the application flow and coordinates between services
 */
export class MobileApp {
  public userPos: GeoLocation | null = null;
  public user: UserProfile;
  public nearestParking: Parking | null = null;
  private watchId: number | null = null;
  private lastPos: GeoLocation | null = null;
  private routeRecalcThresholdMeters: number = 5;
  private parkingfav: Parking[] = [];
  private navigationService: NavigationService | null = null;
  private navigationUI: NavigationUI;

  // Dependency Injection: inject dependencies through constructor
  constructor(
    user: UserProfile,
    private mapView: IMapView,
    private locationService: ILocationService,
    private parkingService: IParkingService,
    private itineraryService: IItineraryService,
    private distanceCalculator: DistanceCalculator,
    private parkingFinder: NearestParkingFinder,
    private routeFormatter: RouteFormatter
  ) {
    this.user = user;
    this.navigationUI = new NavigationUI();
  }

  /** Démarre l'application, récupère la position et les parkings filtrés */
  async start() {
    loader.style.display = "flex";
    try {
      const userPos = await this.locationService.getUserLocation();
      this.userPos = userPos;
      this.mapView.setUserMarker(userPos);
      await this.loadAndDisplayFavorites();

      // Récupère les parkings filtrés selon le profil utilisateur
      const parkings = await this.parkingService.getParkings(this.user, userPos);
      if (!parkings || parkings.length === 0) {
        console.warn("Aucun parking trouvé");
        return;
      }

      // Cherche le parking le plus proche
      this.nearestParking = this.parkingFinder.find(parkings, userPos);

      // Affiche tous les parkings sur la carte
      for (const p of parkings) {
        this.mapView.setParkingMarker(p);
      }

      console.log(
        "Application prête. Cliquez sur le bouton pour démarrer le trajet."
      );
    } catch (err) {
      console.error("Erreur dans start() :", err);
    } finally {
      loader.style.display = "none";
    }
  }


  /** Affiche l'itinéraire entre deux points */
  async showRoute(start: GeoLocation, end: GeoLocation) {
    const itinerary = await this.itineraryService.getItinerary(start, end);
    if (!itinerary) return null;

    const coordinates = itinerary.getCoordinates();
    // Activer le zoom automatique pour la première fois
    this.mapView.drawRoute(coordinates, start, true);

    // Initialiser le service de navigation avec les instructions
    const instructions = itinerary.getInstructions();
    if (instructions.length > 0) {
      this.navigationService = new NavigationService(instructions);
      this.navigationUI.startNavigation(this.navigationService);

      // Afficher le résumé de l'itinéraire en haut de l'écran
      this.navigationUI.showRouteSummary(
        itinerary.getDistance(),
        itinerary.getDuration()
      );
    }

    const summary = this.routeFormatter.formatRouteSummary({
      distance: itinerary.getDistance(),
      duration: itinerary.getDuration(),
    });

    return summary;
  }

  private loadAndDisplayFavorites(): void {
    try {
      const favs = this.user.getPreferences();

      if (!favs || favs.length === 0) return;

      for (const fav of favs) {
        const parkingObj: ParkingObject = {
          _id: fav.apiId ?? fav.id ?? fav.name ?? '',
          _lib: fav.name ?? '',
          _spots: Number(fav.total_spots ?? 0),
          location: {
            latitude: Number(fav.latitude ?? 0),
            longitude: Number(fav.longitude ?? 0),
          },
        };

        this.mapView.setFavoriteParkingMarker(parkingObj);
      }
    } catch (e) {
      console.warn("loadAndDisplayFavorites failed:", e);
    }
  }

  /** Suivi en temps réel de l'utilisateur vers le parking le plus proche */
  public startTracking(): void {
    if (!navigator.geolocation || !this.nearestParking?.location) return;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Navigation mode: display only the target parking
    if (this.nearestParking) {
      this.mapView.showOnlyParking(this.nearestParking);
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (pos: GeolocationPosition) => {
        try {
          this.userPos = new GeoLocation(
            pos.coords.latitude,
            pos.coords.longitude
          );
          this.mapView.setUserMarker(this.userPos, true);

          if (!this.nearestParking) return;

          // Mettre à jour la navigation si elle est active
          if (this.navigationService) {
            const { distanceToNextManeuver, shouldAdvance } =
              this.navigationService.updatePosition(this.userPos);

            this.navigationUI.updateDisplay(distanceToNextManeuver);

            // Centrer la carte sur l'utilisateur avec un zoom adapté à la navigation
            this.mapView.centerOnUserForNavigation(this.userPos);

            if (shouldAdvance) {
              this.navigationService.advanceToNextInstruction();
              this.navigationUI.highlightCurrentInstruction();
              this.navigationUI.updateDisplay();
            }

            // Vérifier si on est arrivé à destination
            if (this.navigationService.isComplete() && distanceToNextManeuver < 20) {
              this.navigationUI.stopNavigation();
              this.navigationService = null;
            }
          }

          const itinerary = await this.itineraryService.getItinerary(
            this.userPos,
            this.nearestParking.location
          );

          const routeInfoEl = document.getElementById("routeInfo");
          if (itinerary) {
            const coords = itinerary.getCoordinates();
            this.mapView.drawRoute(coords, this.userPos, false);

            const summary = this.routeFormatter.formatRouteSummary({
              distance: itinerary.getDistance(),
              duration: itinerary.getDuration(),
            });

            if (routeInfoEl) {
              routeInfoEl.textContent = `Distance : ${summary.distanceKm} km | Durée : ${summary.duration}`;
            }
          } else {
            if (routeInfoEl) {
              routeInfoEl.textContent = "Itinéraire indisponible";
            }
          }
        } catch (err) {
          console.error("Erreur watchPosition :", err);
        }
      },
      (err: GeolocationPositionError) => console.error("Erreur watchPosition :", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  /** Arrête le suivi GPS */
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.mapView.clearRoute();
    this.mapView.showAllParkings();

    // Arrêter la navigation
    if (this.navigationService) {
      this.navigationUI.stopNavigation();
      this.navigationService = null;
    }
  }
}
