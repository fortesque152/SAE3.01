import { GeoLocation } from "./GeoLocation.js";

export class Parking {
  private _id: string;
  private _lib: string;
  private _spots: number;
  private _location: GeoLocation;
  private _allowedVehicleTypes: string[];

  constructor(
    id: string,
    lib: string,
    location: GeoLocation,
    spots: number = 0,
    allowedVehicleTypes: string[] = ["car", "electric", "motorcycle"]
  ) {
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

  updateAvailableSpots(available: number) {
    this._spots = available;
  }

  getAllowedVehicleTypes() {
    return this._allowedVehicleTypes;
  }

  canPark(vehicleType: string) {
    return this._allowedVehicleTypes.includes(vehicleType);
  }
}
