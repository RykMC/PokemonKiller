// src/api/axios.js
import axios from "axios";

const API_URL = import.meta.env.REACT_APP_API_URL;

const api = axios.create({
   baseURL: API_URL || "http://localhost:8000/api",
  timeout: 5000,
});

export default api;
