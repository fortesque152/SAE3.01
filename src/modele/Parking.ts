import { GeoLocation } from "./GeoLocation.js";



export class Parking {

    private _id: string;
    private _lib: string; 
    private _spots: number;
    private _location: GeoLocation ;


    constructor(id: string, lib: string,location : GeoLocation, spots: number) {
        this._id = id;
        this._lib = lib;
        this._spots = spots;
        this._location = location;
    }

    getId() { 
        return this._id; 
    }
    getlib() { 
        return this._lib;
    }
    getAvailableSpot() { 
        if (this._spots > 0) {
            return true
        }        
        return false
    }
    get location() {
        return this._location;
    }

    updateAvailableSpots(available: number) {
        this._spots = available;
    }

    getLocation(){
        return this._location;
    }

    getSpot(){
        return this._spots;
    }
}