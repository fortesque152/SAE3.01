import { GeoLocation } from "./GeoLocation.ts";
export class Itinerary {

    private _start: GeoLocation;
    private _end: GeoLocation;
    private _route: any;

    constructor(start: GeoLocation, end: GeoLocation, route: any) {
        this._start = start;
        this._end = end;
        this._route = route;
    }
    getRoute() { 
        return this._route; 
    }
}

