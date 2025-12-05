import { useState, useEffect } from "react";
import { parkingService } from "../services/parkingService";
import type { Parking } from "../types/Parking";

export function useParkings() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllParkings();
  }, []);

  const fetchAllParkings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await parkingService.fetchParkings();
      setParkings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  const getParkingById = (id: string): Parking | undefined => {
    return parkings.find((p) => p.id === id);
  };

  const getNearbyParkings = (
    lat: number,
    lng: number,
    radiusKm: number = 5
  ): Parking[] => {
    return parkings.filter((parking) => {
      const distance = parkingService.calculateDistance(
        lat,
        lng,
        parking.coordinates.lat,
        parking.coordinates.lng
      );
      return distance <= radiusKm;
    });
  };

  const searchParkings = (query: string): Parking[] => {
    const lowerQuery = query.toLowerCase();
    return parkings.filter(
      (parking) =>
        parking.name.toLowerCase().includes(lowerQuery) ||
        parking.address?.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    parkings,
    loading,
    error,
    getParkingById,
    getNearbyParkings,
    searchParkings,
    refetch: fetchAllParkings,
  };
}
