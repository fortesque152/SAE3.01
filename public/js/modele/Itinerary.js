/**
 * Single Responsibility Principle (SRP):
 * Represents a route between two points with associated metadata
 */
export class Itinerary {
    constructor(coordinates, distance, duration, instructions = []) {
        this._coordinates = coordinates;
        this._distance = distance;
        this._duration = duration;
        this._instructions = instructions;
    }
    getCoordinates() {
        return this._coordinates;
    }
    getDistance() {
        return this._distance;
    }
    getDuration() {
        return this._duration;
    }
    getInstructions() {
        return this._instructions;
    }
}
