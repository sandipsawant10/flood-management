import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast';

const EmergencyResponseMap = ({ emergencies, teamMembers }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ emergencies: [], team: [] });

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([14.5995, 120.9842], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Custom icons
      const emergencyIcon = L.divIcon({
        className: 'bg-red-600 w-4 h-4 rounded-full border-2 border-white',
        iconSize: [16, 16]
      });

      const teamIcon = L.divIcon({
        className: 'bg-blue-600 w-4 h-4 rounded-full border-2 border-white',
        iconSize: [16, 16]
      });

      // Add markers for emergencies
      emergencies.forEach(emergency => {
        const marker = L.marker([emergency.location.lat, emergency.location.lng], {
          icon: emergencyIcon
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-red-600">${emergency.type}</h3>
            <p class="text-sm">${emergency.description}</p>
            <p class="text-xs text-gray-600">Priority: ${emergency.priority}</p>
          </div>
        `);

        markersRef.current.emergencies.push(marker);
      });

      // Add markers for team members
      teamMembers.forEach(member => {
        if (member.location) {
          const marker = L.marker([member.location.lat, member.location.lng], {
            icon: teamIcon
          }).addTo(mapInstanceRef.current);

          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-blue-600">${member.name}</h3>
              <p class="text-sm">Status: ${member.status}</p>
              <p class="text-xs text-gray-600">Last updated: ${new Date(member.lastUpdate).toLocaleString()}</p>
            </div>
          `);

          markersRef.current.team.push(marker);
        }
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.emergencies.forEach(marker => marker.remove());
        markersRef.current.team.forEach(marker => marker.remove());
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = { emergencies: [], team: [] };
      }
    };
  }, [emergencies, teamMembers]);

  const handleMapError = (error) => {
    console.error('Map error:', error);
    toast.error('Failed to load map. Please refresh the page.');
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden"
      onError={handleMapError}
    />
  );
};

EmergencyResponseMap.propTypes = {
  emergencies: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired
      }).isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired
    })
  ).isRequired,
  teamMembers: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number
      }),
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      lastUpdate: PropTypes.string.isRequired
    })
  ).isRequired
};

export default EmergencyResponseMap;