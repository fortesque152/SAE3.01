import { NavigationInstruction } from "./NavigationInstruction.js";

/**
 * Single Responsibility Principle (SRP):
 * Represents a route between two points with associated metadata
 */
export class Itinerary {
    private _coordinates: [number, number][];
    private _distance: number; // meters
    private _duration: number; // seconds
    private _instructions: NavigationInstruction[];

    constructor(
        coordinates: [number, number][],
        distance: number,
        duration: number,
        instructions: NavigationInstruction[] = []
    ) {
        this._coordinates = coordinates;
        this._distance = distance;
        this._duration = duration;
        this._instructions = instructions;
    }

    getCoordinates(): [number, number][] {
        return this._coordinates;
    }

    getDistance(): number {
        return this._distance;
    }

    getDuration(): number {
        return this._duration;
    }

    getInstructions(): NavigationInstruction[] {
        return this._instructions;
    }
}

