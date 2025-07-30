import axios from "axios";
import { getCognitoToken } from "./cognito";
const API_URL = import.meta.env.VITE_HTTP_API_ENDPOINT;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = getCognitoToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
