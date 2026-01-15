export class Parking {
    constructor(id, lib, location, spots = 0, allowedVehicleTypes = ["car", "electric", "motorcycle"]) {
        this._id = id;
        this._lib = lib;
        this._location = location;
        this._spots = spots;
        this._allowedVehicleTypes = allowedVehicleTypes;
    }
    getId() {
        return this._id;
    }
    getlib() {
        return this._lib;
    }
    getAvailableSpot() {
        return this._spots > 0;
    }
    get location() {
        return this._location;
    }
    getLocation() {
        return this._location;
    }
    getSpot() {
        return this._spots;
    }
    updateAvailableSpots(available) {
        this._spots = available;
    }
    getAllowedVehicleTypes() {
        return this._allowedVehicleTypes;
    }
    canPark(vehicleType) {
        return this._allowedVehicleTypes.includes(vehicleType);
    }
}
