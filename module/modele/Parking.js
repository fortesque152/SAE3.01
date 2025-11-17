export class Parking {
    constructor(id, lib, location, spots) {
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
            return true;
        }
        return false;
    }
    get location() {
        return this._location;
    }
    updateAvailableSpots(available) {
        this._spots = available;
    }
}
