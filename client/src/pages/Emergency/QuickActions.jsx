import React from "react";
import {
  Phone,
  AlertTriangle,
  Home,
  Hospital,
  Car,
  MapPin,
} from "lucide-react";

const quickActions = [
  {
    id: "call-help",
    title: "Call for Help",
    description: "Immediate emergency assistance",
    icon: Phone,
    color: "red",
    urgent: true,
    action: () => window.open("tel:108"),
  },
  {
    id: "report-emergency",
    title: "Report Emergency",
    description: "Report flood emergency in your area",
    icon: AlertTriangle,
    color: "orange",
    urgent: true,
    action: () => (window.location.href = "/report-flood"),
  },
  {
    id: "find-shelter",
    title: "Find Shelter",
    description: "Locate nearby evacuation centers",
    icon: Home,
    color: "blue",
    urgent: false,
    action: () => alert("Finding nearby shelters..."),
  },
  {
    id: "medical-help",
    title: "Medical Help",
    description: "Find nearby hospitals and clinics",
    icon: Hospital,
    color: "green",
    urgent: false,
    action: () => window.open("tel:108"),
  },
  {
    id: "transportation",
    title: "Emergency Transport",
    description: "Request emergency transportation",
    icon: Car,
    color: "purple",
    urgent: false,
    action: () => alert("Emergency transportation requested"),
  },
  {
    id: "current-location",
    title: "Share Location",
    description: "Share your current location for rescue",
    icon: MapPin,
    color: "indigo",
    urgent: false,
    action: () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            if (navigator.share) {
              navigator.share({
                title: "My Emergency Location",
                text: "I need help at this location",
                url: locationUrl,
              });
            } else {
              navigator.clipboard.writeText(locationUrl);
              alert("Location copied to clipboard!");
            }
          },
          (error) => {
            alert(
              "Unable to get your location. Please enable location services."
            );
          }
        );
      }
    },
  },
];

const QuickActions = () => {
  const handleAction = (action) => {
    if (action.action) {
      action.action();
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      red: "bg-red-100 text-red-600 border-red-200 hover:bg-red-200",
      orange:
        "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200",
      blue: "bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200",
      green: "bg-green-100 text-green-600 border-green-200 hover:bg-green-200",
      purple:
        "bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200",
      indigo:
        "bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Quick Emergency Actions
        </h2>
        <p className="text-sm text-gray-600">
          Immediate assistance and emergency services
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                action.urgent
                  ? "border-red-200 bg-red-50 hover:border-red-300"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${getColorClasses(
                    action.color
                  )}`}
                >
                  <action.icon className="w-6 h-6" />
                </div>

                <div>
                  <h3
                    className={`font-medium ${
                      action.urgent ? "text-red-900" : "text-gray-900"
                    }`}
                  >
                    {action.title}
                    {action.urgent && (
                      <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                        URGENT
                      </span>
                    )}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      action.urgent ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
