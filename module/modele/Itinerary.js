export class Itinerary {
    constructor(start, end, route) {
        this._start = start;
        this._end = end;
        this._route = route;
    }
    getRoute() {
        return this._route;
    }
}
