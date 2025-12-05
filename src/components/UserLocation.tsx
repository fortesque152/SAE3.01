import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface UserLocationProps {
  map: mapboxgl.Map | null;
}

function UserLocation({ map }: UserLocationProps) {
  useEffect(() => {
    if (!map) return;

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    geolocateControl.on("geolocate", () => {
      map.easeTo({
        zoom: 16,
        pitch: 60,
        duration: 1000,
      });
    });

    map.addControl(geolocateControl);

    map.on("load", () => {
      geolocateControl.trigger();
    });

    return () => {
      // Vérifier que la map existe encore avant de retirer le contrôle
      if (map && map.getContainer()) {
        try {
          map.removeControl(geolocateControl);
        } catch (e) {
          // Ignorer les erreurs si la map a déjà été détruite
          console.log("Map already removed");
        }
      }
    };
  }, [map]);

  return null;
}

export default UserLocation;
