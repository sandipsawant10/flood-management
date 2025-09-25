import axios from "axios";
import { API_URL } from "../utils/constants";

/**
 * Service for handling resource tracking operations
 */
class ResourceService {
  /**
   * Get all resources with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Resources data
   */
  async getResources(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/resources`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching resources:", error);
      this.handleError(error);
    }
  }

  /**
   * Get a specific resource by ID
   * @param {string} resourceId - ID of the resource
   * @returns {Promise<Object>} Resource data
   */
  async getResourceById(resourceId) {
    try {
      const response = await axios.get(`${API_URL}/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource ${resourceId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Create a new resource
   * @param {Object} resourceData - Resource data to create
   * @returns {Promise<Object>} Created resource
   */
  async createResource(resourceData) {
    try {
      const response = await axios.post(`${API_URL}/resources`, resourceData);
      return response.data;
    } catch (error) {
      console.error("Error creating resource:", error);
      this.handleError(error);
    }
  }

  /**
   * Update an existing resource
   * @param {string} resourceId - ID of the resource to update
   * @param {Object} resourceData - Updated resource data
   * @returns {Promise<Object>} Updated resource
   */
  async updateResource(resourceId, resourceData) {
    try {
      const response = await axios.put(
        `${API_URL}/resources/${resourceId}`,
        resourceData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating resource ${resourceId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Delete a resource
   * @param {string} resourceId - ID of the resource to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteResource(resourceId) {
    try {
      const response = await axios.delete(`${API_URL}/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting resource ${resourceId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Allocate a resource to a specific location/entity
   * @param {string} resourceId - ID of the resource to allocate
   * @param {Object} allocationData - Allocation details
   * @returns {Promise<Object>} Allocation confirmation
   */
  async allocateResource(resourceId, allocationData) {
    try {
      const response = await axios.post(
        `${API_URL}/resources/${resourceId}/allocate`,
        allocationData
      );
      return response.data;
    } catch (error) {
      console.error(`Error allocating resource ${resourceId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Return an allocated resource
   * @param {string} resourceId - ID of the resource to return
   * @param {string} allocationId - ID of the allocation
   * @param {Object} returnData - Return details
   * @returns {Promise<Object>} Return confirmation
   */
  async returnResource(resourceId, allocationId, returnData) {
    try {
      const response = await axios.post(
        `${API_URL}/resources/${resourceId}/allocations/${allocationId}/return`,
        returnData
      );
      return response.data;
    } catch (error) {
      console.error(`Error returning resource ${resourceId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Get resource allocation history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Allocation history
   */
  async getAllocationHistory(params = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/resources/allocations/history`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching allocation history:", error);
      this.handleError(error);
    }
  }

  /**
   * Get scheduled resource allocations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Scheduled allocations
   */
  async getScheduledAllocations(params = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/resources/allocations/scheduled`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching scheduled allocations:", error);
      this.handleError(error);
    }
  }

  /**
   * Get resource analytics data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Resource analytics
   */
  async getResourceAnalytics(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/resources/analytics`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching resource analytics:", error);
      this.handleError(error);
    }
  }

  /**
   * Get resource inventory report
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory report
   */
  async getInventoryReport(params = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/resources/inventory-report`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      this.handleError(error);
    }
  }

  /**
   * Export resource data in various formats
   * @param {string} format - Export format (csv, excel, pdf)
   * @param {Object} filters - Export filters
   * @returns {Promise<Blob>} Exported data as blob
   */
  async exportResources(format, filters = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/resources/export/${format}`,
        {
          params: filters,
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error exporting resources as ${format}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Import resources from file
   * @param {File} file - File to import
   * @returns {Promise<Object>} Import results
   */
  async importResources(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/resources/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error importing resources:", error);
      this.handleError(error);
    }
  }

  /**
   * Get resource forecasts based on historical data and predictions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Resource forecasts
   */
  async getResourceForecasts(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/resources/forecasts`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching resource forecasts:", error);
      this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @private
   * @param {Error} error - Error object
   */
  handleError(error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    // Add global error notification here if needed

    throw new Error(message);
  }
}

export const resourceService = new ResourceService();
