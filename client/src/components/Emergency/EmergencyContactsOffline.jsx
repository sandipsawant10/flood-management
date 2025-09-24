import React, { useState, useEffect } from "react";
import {
  Phone,
  Star,
  StarOff,
  User,
  Hospital,
  FireEngine,
  Shield,
} from "lucide-react";
import useOffline from "../../hooks/useOffline";
import { getEmergencyContacts } from "../../services/offlineService";
import axiosInstance from "../../services/axiosConfig";

/**
 * Emergency Contacts component with offline support
 * Displays emergency contact information that's available offline
 */
const EmergencyContactsOffline = ({ limit = 3 }) => {
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const { online } = useOffline();

  // Load emergency contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get contacts from offline storage first
        const offlineContacts = await getEmergencyContacts();

        // If we're online, fetch the latest contacts and update storage
        if (online) {
          try {
            const response = await axiosInstance.get("/emergency/contacts");

            // Store the contacts for offline use
            // This will happen in the background, we already displayed the offline contacts
            const storeEvent = new CustomEvent("storeEmergencyContacts", {
              detail: response.data.contacts,
            });
            window.dispatchEvent(storeEvent);

            setContacts(response.data.contacts);
          } catch (apiError) {
            console.error("Failed to fetch online contacts:", apiError);
            // Fall back to offline contacts
            setContacts(offlineContacts);
          }
        } else {
          // Use offline contacts
          setContacts(offlineContacts);
        }

        // Get favorites from local storage
        const storedFavorites = localStorage.getItem(
          "favoriteEmergencyContacts"
        );
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (err) {
        console.error("Error loading emergency contacts:", err);
        setError("Failed to load emergency contacts");
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [online]);

  // Toggle favorite status of a contact
  const toggleFavorite = (contactId) => {
    const newFavorites = favorites.includes(contactId)
      ? favorites.filter((id) => id !== contactId)
      : [...favorites, contactId];

    setFavorites(newFavorites);
    localStorage.setItem(
      "favoriteEmergencyContacts",
      JSON.stringify(newFavorites)
    );
  };

  // Get contact icon based on type
  const getContactIcon = (type) => {
    switch (type.toLowerCase()) {
      case "hospital":
      case "medical":
        return <Hospital className="h-5 w-5 text-red-600" />;
      case "fire":
        return <FireEngine className="h-5 w-5 text-orange-600" />;
      case "police":
        return <Shield className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  // Filter contacts based on selected filter
  const filteredContacts =
    filter === "all"
      ? contacts
      : filter === "favorites"
      ? contacts.filter((contact) => favorites.includes(contact.id))
      : contacts.filter((contact) => contact.type === filter);

  // Display contacts based on limit
  const displayedContacts = limit
    ? filteredContacts.slice(0, limit)
    : filteredContacts;

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500">{error}</div>
        <p className="text-gray-600 mt-2">
          Please try again later or call emergency services directly.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Emergency Contacts</h3>
        <div className="text-xs font-medium">
          {!online && (
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
              Offline Mode
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 whitespace-nowrap ${
            filter === "favorites"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Star className="h-3 w-3" />
          Favorites
        </button>
        <button
          onClick={() => setFilter("police")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "police"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Police
        </button>
        <button
          onClick={() => setFilter("medical")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "medical"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Medical
        </button>
        <button
          onClick={() => setFilter("fire")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "fire"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Fire
        </button>
      </div>

      {/* Contacts list */}
      <div className="space-y-2 mt-2">
        {displayedContacts.length > 0 ? (
          displayedContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                  {getContactIcon(contact.type)}
                </div>
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-500">
                    {contact.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="h-4 w-4" />
                </a>
                <button
                  onClick={() => toggleFavorite(contact.id)}
                  className={`p-2 rounded-full ${
                    favorites.includes(contact.id)
                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                  aria-label={
                    favorites.includes(contact.id)
                      ? `Remove ${contact.name} from favorites`
                      : `Add ${contact.name} to favorites`
                  }
                >
                  {favorites.includes(contact.id) ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No contacts found for the selected filter
          </div>
        )}
      </div>

      {limit && filteredContacts.length > limit && (
        <div className="mt-3 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Contacts ({filteredContacts.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsOffline;
