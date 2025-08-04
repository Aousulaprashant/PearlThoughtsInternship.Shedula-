// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://json-mock-api-2.onrender.com/", // Your centralized base URL
  // You can also add default headers here if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
