export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_REACT_APP_API_URL ||
  "http://localhost:5000/api";

export default {
  API_BASE_URL,
};
