import { GeoLocation } from "./GeoLocation.ts";


export class ParkingSpot {
    private _id: number;
    private _available: boolean;
    private _position: GeoLocation;

    constructor(id: number, available: boolean, position: GeoLocation) {
        this._id = id;
        this._available = available;
        this._position = position;
    }


    get id(): number {
        return this.id;
    }
    set id(value: number) {
        this._id = value;
    }

    isAvailable(): boolean {
        return this._available;
    }

    setAvailable(available: boolean): void {
        this._available = available;
    }

    getPosition(): GeoLocation {
        return this._position;
    }

    setPosition(position: GeoLocation): void {
        this._position = position;
    }
}