import type { ParkingData, Parking, ParkingFeature } from "../types/Parking";

// URL sans filtre pour récupérer tous les parkings (170)
const PARKING_API_URL =
  "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json";

//  URL avec filtre id is not null :
// "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_filter=id%20is%20not%20null";

export const parkingService = {
  async fetchParkings(): Promise<Parking[]> {
    try {
      const response = await fetch(PARKING_API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch parking data");
      }

      const data: ParkingData = await response.json();

      return this.transformParkingData(data);
    } catch (error) {
      console.error("Error fetching parkings:", error);
      throw error;
    }
  },

  transformParkingData(data: ParkingData): Parking[] {
    return data.features.map((feature: ParkingFeature) => ({
      id: feature.properties.id,
      name: feature.properties.lib || "Parking",
      coordinates: {
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
      },
      type: feature.properties.typ,
      capacity: feature.properties.place_total,
      availableSpots: feature.properties.place_libre,
      cost: feature.properties.cout,
      lastUpdate: feature.properties.place_update,
    }));
  },

  async getParkingById(id: string): Promise<Parking | null> {
    try {
      const parkings = await this.fetchParkings();
      return parkings.find((p) => p.id === id) || null;
    } catch (error) {
      console.error("Error fetching parking by id:", error);
      return null;
    }
  },

  async getNearbyParkings(
    lat: number,
    lng: number,
    radiusKm: number = 5
  ): Promise<Parking[]> {
    try {
      const parkings = await this.fetchParkings();

      return parkings.filter((parking) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          parking.coordinates.lat,
          parking.coordinates.lng
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error("Error fetching nearby parkings:", error);
      return [];
    }
  },

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },
};
