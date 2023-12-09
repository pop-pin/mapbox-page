import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Legend from "./components/Legend";
import Optionsfield from "./components/Optionsfield";
import "./Map.css";
import data from "./seoul.json";
import restaurantImage from "./assets/restaurant.png";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGFpbnlhbmciLCJhIjoiY2xoZndnZm1nMDJuNjNkcDhtMGV1bHNyaiJ9.Gh1Yex2o4Ht3fWz3P8sXuA";

const Map = () => {
  const options = [
    {
      name: "Loc",
      description: "Loc",
      property: "SIG_CD",
      stops: [
        [11110, "#f8d5cc"],
        [11140, "#f4bfb6"],
        [11170, "#f1a8a5"],
        [11200, "#ee8f9a"],
        [11215, "#ec739b"],
        [11230, "#dd5ca8"],
        [11260, "#c44cc0"],
        [11290, "#9f43d7"],
        [11305, "#6e40e6"],
        [11320, "#4d41d9"],
        [11350, "#3142c7"],
        [11380, "#1f44b4"],
        [11410, "#1a4994"],
        [11440, "#1c4f68"],
        [11470, "#245333"],
        [11500, "#2d5c0a"],
        [11530, "#3a6b00"],
        [11545, "#507500"],
        [11560, "#6d8700"],
        [11590, "#8a9800"],
        [11620, "#a7a800"],
        [11650, "#c4b900"],
        [11680, "#e2ca00"],
        [11710, "#ffdb00"],
        [11740, "#ffd100"],
      ],
    },
  ];
  const mapContainerRef = useRef(null);
  const activeRef = useRef(options[0]);
  const [active, setActive] = useState(options[0]);
  const [map, setMap] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [127, 37.58],
      zoom: 10,
    });

    map.on("load", () => {
      map.addSource("countries", {
        type: "geojson",
        data,
      });

      map.setLayoutProperty("country-label", "text-field", [
        "format",
        ["get", "name_en"],
        { "font-scale": 1.2 },
        "\n",
        {},
        ["get", "name"],
        {
          "font-scale": 0.8,
          "text-font": [
            "literal",
            ["DIN Offc Pro Italic", "Arial Unicode MS Regular"],
          ],
        },
      ]);

      map.addLayer(
        {
          id: "country-fills",
          type: "fill",
          source: "countries",
          paint: {
            "fill-opacity": 0.5,
          },
        },
        "country-label"
      );

      map.setPaintProperty("country-fills", "fill-color", {
        property: active.property,
        stops: active.stops,
      });

      map.loadImage(restaurantImage, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("restaurant")) map.addImage("restaurant", image);
      });

      // map.addImage("restaurant", restaurantImage);

      map.addLayer({
        id: "country-icon",
        type: "symbol",
        source: "countries",
        layout: {
          "icon-image": "restaurant",
          "icon-size": 0.1,
        },
      });

      // Add country borders
      map.addLayer({
        id: "country-borders",
        type: "line",
        source: "countries",
        layout: {},
        paint: {
          "line-color": "#627BC1",
          "line-width": 1,
        },
      });

      // Add country hover layer
      map.addLayer({
        id: "country-fills-hover",
        type: "fill",
        source: "countries",
        layout: {},
        paint: {
          "fill-color": "#000000",
          "fill-opacity": 0.3,
        },
        filter: ["==", "name", ""],
      });

      // Add country hover effect
      map.on("mousemove", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["country-fills"],
        });

        if (features.length) {
          map.getCanvas().style.cursor = "pointer";
          map.setFilter("country-fills-hover", [
            "==",
            "name",
            features[0].properties.name,
          ]);
        } else {
          map.setFilter("country-fills-hover", ["==", "name", ""]);
          map.getCanvas().style.cursor = "";
        }
      });

      // Add country un-hover effect
      map.on("mouseout", () => {
        map.getCanvas().style.cursor = "auto";
        map.setFilter("country-fills-hover", ["==", "name", ""]);
      });

      // Add country onclick effect
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["country-fills"],
        });
        if (!features.length) return;
        const { properties } = features[0];
        const { property, description } = activeRef.current;
        alert(
          `(${properties.SIG_KOR_NM}) ${properties[property]} ${description}`
        );
      });

      setMap(map);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []);

  useEffect(() => {
    paint();
  }, [active]);

  const paint = () => {
    if (map) {
      map.setPaintProperty("country-fills", "fill-color", {
        property: active.property,
        stops: active.stops,
      });
      activeRef.current = active;
    }
  };

  const changeState = (i) => {
    setActive(options[i]);
    map.setPaintProperty("country-fills", "fill-color", {
      property: active.property,
      stops: active.stops,
    });
  };

  return (
    <div>
      <div ref={mapContainerRef} className="map-container" />
      <Legend active={active} stops={active.stops} />
      <Optionsfield
        options={options}
        property={active.property}
        changeState={changeState}
      />
    </div>
  );
};

export default Map;
