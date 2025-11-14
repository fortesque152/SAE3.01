export class ParkingSpot {
    constructor(id, position, available) {
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
