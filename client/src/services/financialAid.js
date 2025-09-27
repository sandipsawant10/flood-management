import axiosInstance from "./axiosConfig";

export const getFinancialAidRequests = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortField = "createdAt",
      sortOrder = "desc",
    } = filters;

    const response = await axiosInstance.get("/api/financial-aid", {
      params: { page, limit, status, sortField, sortOrder },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reviewFinancialAidRequest = async (requestId, reviewData) => {
  try {
    const response = await axiosInstance.put(
      `/api/financial-aid/${requestId}/review`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFinancialAidStats = async () => {
  try {
    const response = await axiosInstance.get("/api/financial-aid/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportFinancialAidReport = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/api/financial-aid/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
