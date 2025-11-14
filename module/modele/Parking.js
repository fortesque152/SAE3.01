export class Parking {
    constructor(id, address, location, spots) {
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
