import mapboxgl from "mapbox-gl";
import UserLocation from "./UserLocation";
import "../App.css";

interface NavigationProps {
  map: mapboxgl.Map | null;
  destination: [number, number] | null;
  userLocation: [number, number] | null;
  onNavigationEnd?: () => void;
}

function Navigation({
  map,
  destination,
  userLocation,
  onNavigationEnd,
}: NavigationProps) {
  if (!map || !destination || !userLocation)
    return "Erreur : coordonnées manquantes pour la navigation.";

  return <div className="navigation-container">*</div>;
}

export default Navigation;
