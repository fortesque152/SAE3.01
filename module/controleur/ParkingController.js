import { Parking } from "../modele/Parking";
import { GeoLocation } from "../modele/GeoLocation";
export class ParkingController {
    constructor() {
        this.url = "https://www.data.gouv.fr/api/1/datasets/r/5ccdcfdc-0a8b-4524-9b59-7f0212e4ad5c";
    }
    async getParkings() {
        const res = await fetch(this.url);
        const data = await res.json();
        return data.map((p) => new Parking(p.id, p.name, new GeoLocation(p.latitude, p.longitude), p.available_spots));
    }
}
