export interface ParkingCoordinates {
  lng: number;
  lat: number;
}

export interface ParkingProperties {
  fid: number;
  id: string;
  typ: string;
  lib: string;
  _commid: string;
  place_total: number;
  place_libre: number;
  cout: string;
  place_update: string;
}

export interface ParkingFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  geometry_name: string;
  properties: ParkingProperties;
  bbox: [number, number, number, number];
}

export interface ParkingData {
  type: string;
  features: ParkingFeature[];
  totalFeatures: number;
  numberMatched: number;
  numberReturned: number;
  timeStamp: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  bbox: [number, number, number, number];
}

export interface Parking {
  id: string;
  name: string;
  coordinates: ParkingCoordinates;
  type: string;
  capacity: number;
  availableSpots: number;
  cost: string; // payant/gratuit
  lastUpdate: string;
  trend: string;
}
