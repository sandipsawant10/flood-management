const emergencyService = {
  getEmergencyData: async (location) => {
    // Mock data - replace with actual API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hospitals: [
            {
              name: "City General Hospital",
              address: "123 Main St",
              phone: "+91-11-12345678",
              distance: 1.2,
              coordinates: [77.209, 28.6139],
            },
          ],
          shelters: [
            {
              name: "Community Center",
              address: "456 School Rd",
              phone: "+91-11-87654321",
              distance: 0.8,
              capacity: 200,
              currentOccupancy: 45,
              coordinates: [77.219, 28.6239],
            },
          ],
        });
      }, 1000);
    });
  },

  getActiveIncidents: async (location) => {
    // Mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            title: "Heavy Rainfall Alert",
            location: "City Center",
            type: "weather",
          },
        ]);
      }, 500);
    });
  },

  getEmergencyContacts: async () => {
    try {
      const response = await fetch('/api/emergency/contacts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.contacts;
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      return [];
    }
  },
};

export { emergencyService };
