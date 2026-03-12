import axios from "axios";
import { NativeModules } from "react-native";

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // On physical devices, use the Metro host IP instead of localhost.
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    const hostMatch = scriptURL?.match(/https?:\/\/([^/:]+)/);
    const host = hostMatch?.[1];

    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === "Network Error") {
    return "Unable to reach the server. Check your connection.";
  }
  return error.message || "Something went wrong. Please try again.";
};

export default api;
