/**
 * Dependency Injection Container
 * Single Responsibility Principle (SRP): Responsible only for creating and wiring dependencies
 * Open/Closed Principle (OCP): Easy to extend with new implementations
 */
import { MobileApp } from "../MobileApp.js";
import { LocationController } from "../controleur/LocationController.js";
import { ParkingController } from "../controleur/ParkingController.js";
import { ItineraryController } from "../controleur/ItineraryController.js";
import { MapView } from "../ui/MapView.js";
import { DistanceCalculator } from "../services/DistanceCalculator.js";
import { NearestParkingFinder } from "../services/NearestParkingFinder.js";
import { RouteFormatter } from "../services/RouteFormatter.js";
/**
 * Factory function to create and configure the MobileApp with all dependencies
 * Dependency Inversion Principle (DIP): High-level module (MobileApp) depends on abstractions
 */
export function createMobileApp(user) {
    // Create services
    const distanceCalculator = new DistanceCalculator();
    const routeFormatter = new RouteFormatter();
    const nearestParkingFinder = new NearestParkingFinder(distanceCalculator);
    // Create controllers (which implement interfaces)
    const locationService = new LocationController();
    const parkingService = new ParkingController();
    const itineraryService = new ItineraryController();
    // Create view (which implements interface)
    const mapView = new MapView(locationService);
    // Inject all dependencies into MobileApp
    return new MobileApp(user, mapView, locationService, parkingService, itineraryService, distanceCalculator, nearestParkingFinder, routeFormatter);
}
