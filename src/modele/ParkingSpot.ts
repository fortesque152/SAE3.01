import { GeoLocation } from "./GeoLocation";

export class ParkingSpot {

    private _id: string;
    private _position: GeoLocation;
    private _available: boolean;

    constructor(id: string, position: GeoLocation, available: boolean) {
        this._id = id;
        this._position = position;
        this._available = available;
     }

    getId() { 
        return this._id; 
    }
    isAvailable() { 
        return this._available; 
    }
    getPosition() { 
        return this._position; 
    }
}