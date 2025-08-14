// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://json-mock-api-2.onrender.com/", 
  baseURL:"http://localhost:5000/",

  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
