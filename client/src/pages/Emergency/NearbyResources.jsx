import React from "react";
import { MapPin, Phone, Users, Clock, Navigation } from "lucide-react";

// Mock data for nearby resources (you can replace with API call)
const mockResources = [
  {
    id: 1,
    name: "City General Hospital",
    type: "hospital",
    address: "123 Main Street, City Center",
    phone: "+91-11-12345678",
    distance: 1.2,
    availability: "Open 24/7",
    capacity: 150,
    coordinates: [77.209, 28.6139],
  },
  {
    id: 2,
    name: "Community Evacuation Center",
    type: "shelter",
    address: "456 School Road, Sector 5",
    phone: "+91-11-87654321",
    distance: 2.8,
    availability: "Emergency Only",
    capacity: 500,
    coordinates: [77.219, 28.6239],
  },
  {
    id: 3,
    name: "Fire Station North",
    type: "fire-station",
    address: "789 Emergency Lane",
    phone: "101",
    distance: 0.8,
    availability: "Open 24/7",
    capacity: null,
    coordinates: [77.199, 28.6039],
  },
];

const NearbyResources = ({ resources = mockResources }) => {
  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleDirections = (coordinates, name) => {
    const [lng, lat] = coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "hospital":
        return "🏥";
      case "shelter":
        return "🏠";
      case "fire-station":
        return "🚒";
      default:
        return "📍";
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case "hospital":
        return "text-red-600 bg-red-100";
      case "shelter":
        return "text-blue-600 bg-blue-100";
      case "fire-station":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Nearby Emergency Resources
        </h2>
        <p className="text-sm text-gray-600">
          Hospitals, shelters, and emergency services
        </p>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${getResourceColor(
                      resource.type
                    )}`}
                  >
                    <span className="text-xl">
                      {getResourceIcon(resource.type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {resource.name}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{resource.distance.toFixed(1)} km away</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {resource.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{resource.availability}</span>
                </div>
                {resource.capacity && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-3 h-3 mr-1" />
                    <span>Capacity: {resource.capacity}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {resource.phone && (
                  <button
                    onClick={() => handleCall(resource.phone)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </button>
                )}
                <button
                  onClick={() =>
                    handleDirections(resource.coordinates, resource.name)
                  }
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Directions
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No emergency resources found nearby</p>
            <p className="text-sm">Searching for resources in your area...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyResources;
