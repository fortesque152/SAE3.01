/// <reference lib="dom" />
import { GeoLocation } from "./modele/GeoLocation.js";
import { NavigationService } from "./services/NavigationService.js";
import { NavigationUI } from "./ui/NavigationUI.js";
const loader = document.getElementById("loaderContainer");
/**
 * Dependency Inversion Principle (DIP):
 * Depend on abstractions (interfaces) rather than concrete implementations
 * Single Responsibility Principle (SRP):
 * Orchestrates the application flow and coordinates between services
 */
export class MobileApp {
    // Dependency Injection: inject dependencies through constructor
    constructor(user, mapView, locationService, parkingService, itineraryService, distanceCalculator, parkingFinder, routeFormatter) {
        this.mapView = mapView;
        this.locationService = locationService;
        this.parkingService = parkingService;
        this.itineraryService = itineraryService;
        this.distanceCalculator = distanceCalculator;
        this.parkingFinder = parkingFinder;
        this.routeFormatter = routeFormatter;
        this.userPos = null;
        this.nearestParking = null;
        this.watchId = null;
        this.lastPos = null;
        this.routeRecalcThresholdMeters = 5;
        this.parkingfav = [];
        this.navigationService = null;
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
            console.log("Application prête. Cliquez sur le bouton pour démarrer le trajet.");
        }
        catch (err) {
            console.error("Erreur dans start() :", err);
        }
        finally {
            loader.style.display = "none";
        }
    }
    /** Affiche l'itinéraire entre deux points */
    async showRoute(start, end) {
        const itinerary = await this.itineraryService.getItinerary(start, end);
        if (!itinerary)
            return null;
        const coordinates = itinerary.getCoordinates();
        // Activer le zoom automatique pour la première fois
        this.mapView.drawRoute(coordinates, start, true);
        // Initialiser le service de navigation avec les instructions
        const instructions = itinerary.getInstructions();
        if (instructions.length > 0) {
            this.navigationService = new NavigationService(instructions);
            this.navigationUI.startNavigation(this.navigationService);
            // Afficher le résumé de l'itinéraire en haut de l'écran
            this.navigationUI.showRouteSummary(itinerary.getDistance(), itinerary.getDuration());
        }
        const summary = this.routeFormatter.formatRouteSummary({
            distance: itinerary.getDistance(),
            duration: itinerary.getDuration(),
        });
        return summary;
    }
    loadAndDisplayFavorites() {
        try {
            const favs = this.user.getPreferences();
            if (!favs || favs.length === 0)
                return;
            for (const fav of favs) {
                const parkingObj = {
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
        }
        catch (e) {
            console.warn("loadAndDisplayFavorites failed:", e);
        }
    }
    /** Suivi en temps réel de l'utilisateur vers le parking le plus proche */
    startTracking() {
        if (!navigator.geolocation || !this.nearestParking?.location)
            return;
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        // Navigation mode: display only the target parking
        if (this.nearestParking) {
            this.mapView.showOnlyParking(this.nearestParking);
        }
        this.watchId = navigator.geolocation.watchPosition(async (pos) => {
            try {
                this.userPos = new GeoLocation(pos.coords.latitude, pos.coords.longitude);
                this.mapView.setUserMarker(this.userPos, true);
                if (!this.nearestParking)
                    return;
                // Mettre à jour la navigation si elle est active
                if (this.navigationService) {
                    const { distanceToNextManeuver, shouldAdvance } = this.navigationService.updatePosition(this.userPos);
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
                const itinerary = await this.itineraryService.getItinerary(this.userPos, this.nearestParking.location);
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
                }
                else {
                    if (routeInfoEl) {
                        routeInfoEl.textContent = "Itinéraire indisponible";
                    }
                }
            }
            catch (err) {
                console.error("Erreur watchPosition :", err);
            }
        }, (err) => console.error("Erreur watchPosition :", err), { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
    /** Arrête le suivi GPS */
    stopTracking() {
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
