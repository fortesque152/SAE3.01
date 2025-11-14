import { ParkingSpot } from "./ParkingSpot.ts";
import { GeoLocation } from "./GeoLocation.ts";

export class Parking {

    private _id: string;
    private _address: string; 
    private _spots: ParkingSpot[];
    private _location: GeoLocation ;


    constructor(id: string, address: string,location : GeoLocation, spots: ParkingSpot[]) {
        this._id = id;
        this._address = address;
        this._spots = spots;
        this._location = location;
    }

    getId() { 
        return this._id; 
    }
    getAddress() { 
        return this._address;
    }
    getAvailableSpot() { 
        return this._spots.find(s => s.isAvailable()) || null; 
    }
    get location() {
        return this._location;
    }


}