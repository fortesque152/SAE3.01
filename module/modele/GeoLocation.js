export class GeoLocation {
    constructor(lat, lon) {
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
