import { LocationController } from "./controleur/LocationController.js";
import { ParkingController } from "./controleur/ParkingController.js";
import { ItineraryController } from "./controleur/ItineraryController.js";
import { MapView } from "./ui/MapView.js";
import { UserProfile } from "./modele/UserProfile.js";
import { GeoLocation } from "./modele/GeoLocation.js";


export class MobileApp {
    private user: UserProfile;
    private map: MapView;
    private locCtrl: LocationController;
    private parkCtrl: ParkingController;
    private itineraryCtrl: ItineraryController;


    constructor() {
        this.user = new UserProfile("user-name", "user-surname");
        this.map = new MapView();
        this.locCtrl = new LocationController();
        this.parkCtrl = new ParkingController();
        this.itineraryCtrl = new ItineraryController();
    }


    async start() {
        const userPos = await this.locCtrl.getUserLocation();
        this.map.setUserMarker();


        const parkings = await this.parkCtrl.getParkings();


        const nearest = parkings.reduce((closest, curr) => {
            const dist = this.getDistance(userPos, curr.location);
            return dist < this.getDistance(userPos, closest.location) ? curr : closest;
        }, parkings[0]);


        this.map.setParkingMarker(nearest);


        const route = await this.itineraryCtrl.getItinerary(userPos, nearest.location);


        const geometry = route.features[0].geometry.coordinates;
        this.map.drawRoute(geometry);
    }


    private getDistance(a: GeoLocation, b: GeoLocation): number {
        const R = 6371e3;
        const φ1 = a.latitude * Math.PI / 180;
        const φ2 = b.latitude * Math.PI / 180;
        const Δφ = (b.latitude - a.latitude) * Math.PI / 180;
        const Δλ = (b.longitude - a.longitude) * Math.PI / 180;


        const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
}