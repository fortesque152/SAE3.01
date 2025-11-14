export class GeoLocation {

    private _lat: number
    private _lon: number
    
    constructor(lat: number, lon: number)  { 
        this._lat = lat;
        this._lon = lon;

    }

    get latitude() {
         return this._lat; 
    }
    
    get longitude() {
         return this._lon; 
        }
}