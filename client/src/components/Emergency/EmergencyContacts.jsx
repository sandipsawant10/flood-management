import React from "react";
import { Phone, Clock, Shield, Hospital, AlertTriangle } from "lucide-react";

const emergencyContacts = [
  {
    id: 1,
    name: "Police Emergency",
    phone: "100",
    type: "police",
    icon: Shield,
    available24x7: true,
    description: "For crime reporting and police assistance",
  },
  {
    id: 2,
    name: "Fire Services",
    phone: "101",
    type: "fire",
    icon: AlertTriangle,
    available24x7: true,
    description: "Fire emergencies and rescue operations",
  },
  {
    id: 3,
    name: "Medical Emergency",
    phone: "108",
    type: "medical",
    icon: Hospital,
    available24x7: true,
    description: "Medical emergencies and ambulance services",
  },
  {
    id: 4,
    name: "Disaster Management",
    phone: "1070",
    type: "disaster",
    icon: AlertTriangle,
    available24x7: true,
    description: "Natural disaster response and coordination",
  },
  {
    id: 5,
    name: "Women Helpline",
    phone: "181",
    type: "women",
    icon: Phone,
    available24x7: true,
    description: "Support for women in distress",
  },
];

const EmergencyContacts = () => {
  const callNumber = (phone, name) => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    window.open(`tel:${phone}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Emergency Contacts
        </h2>
        <p className="text-sm text-gray-600">24/7 helpline numbers</p>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {emergencyContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => callNumber(contact.phone, contact.name)}
            className="w-full p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-left group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200">
                <contact.icon className="w-5 h-5 text-red-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 group-hover:text-red-900">
                    {contact.name}
                  </h4>
                  <span className="text-lg font-bold text-red-600">
                    {contact.phone}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {contact.description}
                </p>

                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">24/7 Available</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmergencyContacts;
