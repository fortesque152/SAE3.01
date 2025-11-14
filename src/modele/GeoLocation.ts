export class GeoLocation {
    private _time: Date;
    private _latitude: number;
    private _longitude: number;

    constructor(time: Date, latitude: number, longitude: number) {
        this._time = time;
        this._latitude = latitude;
        this._longitude = longitude;
     }


    locationUpdate(time: Date, lat: number, lon: number): void {
        this._time = time;
        this._latitude = lat;
        this._longitude = lon;
    }


    get time(): Date { 
        return this.time; 
    }
    set time(value: Date) { 
        this._time = value; 
    }

    get latitude(): number { 
        return this.latitude; 
    }

    set latitude(value: number) { 
        this._latitude = value; 
    }

    get longitude(): number { 
        return this.longitude; 
    }

    set longitude(value: number) { 
        this._longitude = value; 
    }
}