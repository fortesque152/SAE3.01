import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { parkingService } from "../services/parkingService";
import type { Parking } from "../types/Parking";
import "../App.css";

interface ParkingMarkerProps {
  map: mapboxgl.Map | null;
}

function ParkingMarker({ map }: ParkingMarkerProps) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    parkingService
      .fetchParkings()
      .then((data) => {
        setParkings(data);
        console.log(`${data.length} parkings chargés`);
      })
      .catch((error) => console.error("Error fetching parkings:", error));
  }, []);

  useEffect(() => {
    if (!map || parkings.length === 0) return;

    markers.forEach((marker) => marker.remove());

    const newMarkers = parkings.map((parking) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([parking.coordinates.lng, parking.coordinates.lat])
        .addTo(map);

      const availabilityPercent =
        (parking.availableSpots / parking.capacity) * 100;
      const availabilityClass =
        availabilityPercent > 50
          ? "availability-high"
          : availabilityPercent > 20
          ? "availability-medium"
          : "availability-low";

      const popupContent = `
        <div class="popup-container">
          <h3>${parking.name}</h3>
          <p class="parking-type">${parking.type} • ${parking.cost}</p>
          
          <div class="popup-stats">
            <div class="stat-item ${availabilityClass}">
              <span class="stat-label">Places disponibles</span>
              <span class="stat-value">${parking.availableSpots} / ${parking.capacity}</span>
            </div>
          </div>
          
      `;

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "320px",
        className: "custom-popup",
      }).setHTML(popupContent);

      marker.setPopup(popup);
      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.remove());
    };
  }, [map, parkings]);

  return null;
}

export default ParkingMarker;
