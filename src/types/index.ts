/**
 * Type definitions for Leaflet and external dependencies
 * This file provides type safety for third-party libraries
 */
/// <reference lib="dom" />

// Leaflet types
export interface LeafletMarker {
    addTo(map: LeafletMap): this;
    setLatLng(latlng: [number, number]): this;
    bindPopup(content: string): this;
    on(event: string, handler: (e: LeafletEvent) => void): this;
}

export interface LeafletMap {
    setView(center: [number, number], zoom: number): this;
    getZoom(): number;
    fitBounds(bounds: LeafletBounds, options?: Record<string, unknown>): this;
    removeLayer(layer: LeafletLayer): this;
    hasLayer(layer: LeafletLayer): boolean;
}

export interface LeafletBounds {
    _southWest?: { lat: number; lng: number };
    _northEast?: { lat: number; lng: number };
}

export interface LeafletLayer {
    addTo(map: LeafletMap): this;
    getBounds?(): LeafletBounds;
}

export interface LeafletPolyline extends LeafletLayer {
    getBounds(): LeafletBounds;
}

export interface LeafletEvent {
    popup?: {
        getElement(): HTMLElement;
    };
}

// Overpass/GeoJSON types
export interface OverpassElement {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: Record<string, string>;
}

export interface OverpassResponse {
    elements?: OverpassElement[];
}

export interface GeoJSONFeature {
    type: string;
    geometry?: {
        type: string;
        coordinates: [number, number] | [number, number][];
    };
    properties?: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
    type: string;
    features?: GeoJSONFeature[];
}

// Coordinate types
export type Coordinate = [number, number];

// Favorite parking type
export interface FavoriteParking {
    apiId?: string;
    id?: string;
    name: string;
    total_spots?: number;
    latitude: number;
    longitude: number;
}

// Parking object interface
export interface ParkingObject {
    _id: string;
    _lib: string;
    _spots: number;
    location: {
        latitude: number;
        longitude: number;
    };
    getId?: () => string;
    getid?: () => string;
    getLib?: () => string;
    getlib?: () => string;
}
