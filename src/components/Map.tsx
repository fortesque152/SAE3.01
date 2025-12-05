import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../App.css";
import UserLocation from "./UserLocation";
import ParkingMarker from "./ParkingMarker";

function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [6.17538, 49.11994],
      zoom: 14,
      pitch: 60,
      style: "mapbox://styles/hmtici/cmig2jz7s000y01pe5lm273qv",
    });

    setMap(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
      <UserLocation map={map} />
      <ParkingMarker map={map} />
    </>
  );
}

export default Map;
