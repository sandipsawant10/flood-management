const AMENITIES = [
  'hospital',
  'fire_station',
  'police',
  'ambulance_station',
  'shelter',
  'community_centre',
  'pharmacy',
  'social_facility',
  'bus_station',
  'railway_station',
  'toilets',
  'drinking_water',
  'fuel',
  'charging_station',
  'assembly_point',
  'school',
  'college',
];

export async function fetchNearbyEmergencyResources(lat, lon, radius) {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${AMENITIES.map(amenity => `node(around:${radius},${lat},${lon})[amenity=${amenity}];`).join('\n')}
      ${AMENITIES.map(amenity => `way(around:${radius},${lat},${lon})[amenity=${amenity}];`).join('\n')}
      ${AMENITIES.map(amenity => `relation(around:${radius},${lat},${lon})[amenity=${amenity}];`).join('\n')}
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.elements.filter(element => element.lat && element.lon).map(element => ({
      amenity: element.tags.amenity,
      name: element.tags.name || element.tags[`name:${element.tags.amenity}`] || element.tags.description || element.tags.operator || element.tags.brand || `Unnamed ${element.tags.amenity}`,
      lat: element.lat || (element.center ? element.center.lat : undefined),
      lon: element.lon || (element.center ? element.center.lon : undefined),
      address: element.tags.addr ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street'] || ''}, ${element.tags['addr:city'] || ''}, ${element.tags['addr:postcode'] || ''}`.trim() : '',
    }));

  } catch (error) {
    console.error('Error fetching nearby emergency resources:', error);
    return [];
  }
}