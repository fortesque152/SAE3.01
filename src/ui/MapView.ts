import { GeoLocation } from "../modele/GeoLocation.ts";
import { Parking } from "../modele/Parking.ts";

declare const L: any;
export class MapView {
 
    private map: any;


    constructor() {
        this.map = L.map('map').setView([49.1193, 6.1757], 13);


        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
    }


    setUserMarker(position: GeoLocation) {
        L.marker([position.latitude, position.longitude], {
            title: "Votre position"
        }).addTo(this.map);
        this.map.setView([position.latitude, position.longitude], 15);
    }


    setParkingMarker(parking: Parking) {
        L.marker([parking.location.latitude, parking.location.longitude]).addTo(this.map);
    }


    drawRoute(polyline: any) {
        const coords = polyline.map((c: any) => [c[1], c[0]]);
        L.polyline(coords).addTo(this.map);
    }
}