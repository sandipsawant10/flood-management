import axios from '../utils/axios';

const BASE_URL = '/api/financial-aid';

export const submitFinancialAidRequest = async (data) => {
  const response = await axios.post(BASE_URL, data);
  return response.data;
};

export const getFinancialAidRequests = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const reviewFinancialAidRequest = async (requestId, reviewData) => {
  const response = await axios.put(`${BASE_URL}/${requestId}/review`, reviewData);
  return response.data;
};