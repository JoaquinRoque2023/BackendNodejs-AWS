// lib/util.js
// Mapeo de planetas de Star Wars a coordenadas terrestres aproximadas
// para obtener datos meteorológicos representativos

export const mapPlanetToCoords = (planetName) => {
  const planetMap = {
    // Planetas principales de Star Wars mapeados a ubicaciones terrestres
    "Tatooine": { lat: 25.0, lon: 35.0, location: "Desierto de Arabia", climate: "desert" },
    "Alderaan": { lat: 46.8, lon: 8.2, location: "Suiza", climate: "temperate" },
    "Yavin IV": { lat: -3.4, lon: -60.0, location: "Amazonas", climate: "tropical" },
    "Hoth": { lat: -75.0, lon: 0.0, location: "Antártida", climate: "frozen" },
    "Dagobah": { lat: 10.0, lon: -84.0, location: "Costa Rica", climate: "swamp" },
    "Bespin": { lat: 40.7, lon: -74.0, location: "Nueva York", climate: "temperate" },
    "Endor": { lat: 47.0, lon: -121.0, location: "Bosques del Pacífico", climate: "forest" },
    "Naboo": { lat: 45.4, lon: 12.3, location: "Venecia", climate: "temperate" },
    "Coruscant": { lat: 51.5, lon: -0.1, location: "Londres", climate: "urban" },
    "Kamino": { lat: 20.0, lon: -155.0, location: "Hawaii", climate: "oceanic" },
    "Geonosis": { lat: -24.0, lon: 133.0, location: "Outback Australiano", climate: "arid" },
    "Utapau": { lat: 36.0, lon: 103.0, location: "Mesetas de Asia Central", climate: "arid" },
    "Mustafar": { lat: 19.4, lon: -155.3, location: "Volcanes de Hawaii", climate: "volcanic" },
    "Kashyyyk": { lat: 6.0, lon: -75.0, location: "Selva Colombiana", climate: "forest" },
    "Polis Massa": { lat: 69.0, lon: 33.0, location: "Ártico", climate: "frozen" },
    "Mygeeto": { lat: -77.0, lon: 166.0, location: "Antártida", climate: "frozen" },
    "Felucia": { lat: -6.0, lon: 107.0, location: "Java", climate: "tropical" },
    "Cato Neimoidia": { lat: 40.0, lon: 116.0, location: "Beijing", climate: "temperate" },
    "Saleucami": { lat: 25.0, lon: 46.0, location: "Arabia", climate: "desert" },
    "Stewjon": { lat: 56.0, lon: -3.0, location: "Escocia", climate: "temperate" },
    "Eriadu": { lat: 52.0, lon: 13.0, location: "Berlín", climate: "temperate" },
    "Corellia": { lat: 41.9, lon: 12.5, location: "Roma", climate: "temperate" },
    "Rodia": { lat: 10.0, lon: -69.0, location: "Venezuela", climate: "tropical" },
    "Nal Hutta": { lat: 31.0, lon: 35.0, location: "Medio Oriente", climate: "arid" },
    "Dantooine": { lat: 45.0, lon: -93.0, location: "Praderas de Minnesota", climate: "grassland" },
    "Bestine IV": { lat: 30.0, lon: 31.0, location: "Egipto", climate: "desert" },
    "Ord Mantell": { lat: 40.0, lon: -74.0, location: "Nueva York", climate: "urban" },
    "unknown": null,
    "": null
  };

  const coords = planetMap[planetName] || null;
  
  if (coords) {
    return {
      lat: coords.lat,
      lon: coords.lon,
      terrestrial_equivalent: coords.location,
      expected_climate: coords.climate
    };
  }
  
  return null;
};