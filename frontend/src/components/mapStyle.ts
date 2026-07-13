// Compact dark map style for react-native-maps (Google style array).
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b6b6b" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#182818" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b2b2b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6e6e6e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a3a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#242424" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d5a7a" }] },
];
