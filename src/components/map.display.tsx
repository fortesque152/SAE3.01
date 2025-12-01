import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import "../App.css";

function MapDisplay() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_API_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [6.17538, 49.11994],
      zoom: 14,
      pitch: 60,

      style: "mapbox://styles/hmtici/cmig2jz7s000y01pe5lm273qv",
    });

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    mapRef.current.addControl(geolocateControl);

    mapRef.current.on("load", () => {
      geolocateControl.trigger();
    });

    fetch(
      "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json&cql_filter=id%20is%20not%20null"
    )
      .then((response) => response.json())
      .then((data) => {
        data.features.forEach((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          const popup = new mapboxgl.Popup({ offset: 45 }).setText(
            feature.properties.lib || "Parking"
          );

          marker.setPopup(popup);
          console.log("parking marker added");
        });
      })
      .catch((error) => console.error("Error fetching markers:", error));

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default MapDisplay;
