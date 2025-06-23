// src/api/axios.js
import axios from "axios";

const api = axios.create({
   baseURL: "https://project9-pokemon-battlegame.onrender.com/",
  timeout: 5000,
});

export default api;
