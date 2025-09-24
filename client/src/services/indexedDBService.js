/**
 * IndexedDB Service
 * Provides a wrapper around IndexedDB for offline data storage
 */

const DB_NAME = "AquaAssistOfflineDB";
const DB_VERSION = 1;
const STORES = {
  OFFLINE_REQUESTS: "offlineRequests",
  FLOOD_REPORTS: "floodReports",
  ALERTS: "alerts",
  USER_DATA: "userData",
  EMERGENCY_CONTACTS: "emergencyContacts",
};

/**
 * Initialize the IndexedDB database
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Check for IndexedDB support
    if (!window.indexedDB) {
      console.error(
        "Your browser does not support IndexedDB. Offline functionality will be limited."
      );
      return reject(new Error("IndexedDB not supported"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (schema changes)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.OFFLINE_REQUESTS)) {
        const offlineRequestsStore = db.createObjectStore(
          STORES.OFFLINE_REQUESTS,
          { keyPath: "id" }
        );
        offlineRequestsStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
        offlineRequestsStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FLOOD_REPORTS)) {
        const reportsStore = db.createObjectStore(STORES.FLOOD_REPORTS, {
          keyPath: "id",
        });
        reportsStore.createIndex("timestamp", "timestamp", { unique: false });
        reportsStore.createIndex("synced", "synced", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ALERTS)) {
        const alertsStore = db.createObjectStore(STORES.ALERTS, {
          keyPath: "id",
        });
        alertsStore.createIndex("timestamp", "timestamp", { unique: false });
        alertsStore.createIndex("read", "read", { unique: false });
        alertsStore.createIndex("severity", "severity", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.EMERGENCY_CONTACTS)) {
        const emergencyContactsStore = db.createObjectStore(
          STORES.EMERGENCY_CONTACTS,
          { keyPath: "id" }
        );
        emergencyContactsStore.createIndex("type", "type", { unique: false });
      }

      console.log("IndexedDB database setup complete");
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log("IndexedDB connection opened successfully");
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Open a connection to the database
 */
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Add an item to a specific store
 * @param {string} storeName - Name of the object store
 * @param {object} item - Item to store
 */
export const addItem = async (storeName, item) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error adding item to ${storeName}:`, error);
    throw error;
  }
};

/**
 * Update an item in a specific store
 * @param {string} storeName - Name of the object store
 * @param {object} item - Item to update (must include the key)
 */
export const updateItem = async (storeName, item) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error updating item in ${storeName}:`, error);
    throw error;
  }
};

/**
 * Get an item from a specific store
 * @param {string} storeName - Name of the object store
 * @param {string|number} key - Key of the item to get
 */
export const getItem = async (storeName, key) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error getting item from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Get all items from a specific store
 * @param {string} storeName - Name of the object store
 * @param {object} query - Query parameters (optional)
 * @param {string} query.indexName - Name of the index to query
 * @param {any} query.value - Value to match in the index
 */
export const getAllItems = async (storeName, query = null) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      let request;
      if (query && query.indexName) {
        const index = store.index(query.indexName);
        request =
          query.value !== undefined
            ? index.getAll(query.value)
            : index.getAll();
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error getting all items from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Delete an item from a specific store
 * @param {string} storeName - Name of the object store
 * @param {string|number} key - Key of the item to delete
 */
export const deleteItem = async (storeName, key) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error deleting item from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Clear all items from a specific store
 * @param {string} storeName - Name of the object store
 */
export const clearStore = async (storeName) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error clearing store ${storeName}:`, error);
    throw error;
  }
};

/**
 * Export database constant names
 */
export const STORES_ENUM = STORES;
