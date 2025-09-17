// src/api.js
import axios from "axios";
import { auth } from "./firebase";

// In development, use /api prefix which will be proxied to the backend
// In production, this will be an empty string for relative URLs
const API_BASE_URL = import.meta.env.DEV ? '/api' : '';
console.log("API Base URL:", API_BASE_URL || '(relative)');
// Create an Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});
// Agrega un interceptor para incluir el token en cada request
api.interceptors.request.use(async (config) => {
  // const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtener todos los retos
export const obtenerRetos = async () => {
  const res = await api.get("/matches");
  return res.data;
};

// Obtener detalle de un reto
export const obtenerReto = async (id) => {
  const res = await api.get(`/matches/${id}`);
  return res.data;
};

// Crear un nuevo reto
export const crearReto = async (reto) => {
  const res = await api.post("/matches", reto);
  return res.data;
};

// Unirse a un reto
export const unirseAReto = async (id, userId, userName, posicionSeleccionada, team) => {
  const res = await api.post(`/matches/${id}/join`, {
    user_id: userId,
    name: userName, // luego deberías sacar el nombre real del usuario logueado
    position: posicionSeleccionada,
    team, // "local" | "visitante"
    confirmed: true,
  });
  return res.data;
};

// Salir de un reto
export const salirDeReto = async (id, userId) => {
  const res = await api.post(`/matches/${id}/quit`, { user_id: userId }, { headers: { "Content-Type": "application/json" } });
  return res.data;
};

// Confirmar asistencia
export const confirmarAsistencia = async (id, userId) => {
  const res = await api.post(`/matches/${id}/confirm`, { user_id: userId }, { headers: { "Content-Type": "application/json" } });
  return res.data;
};

// Retos por usuario
export const obtenerRetosPorUsuario = async (userId) => {
  const res = await api.get(`/users/${userId}/matches`);
  return res.data;
};

// Actualizar estado del reto
export const actualizarMatchStatus = async (id, userId, status) => {
  const res = await api.post(`/matches/${id}/status`, {
    user_id: userId,
    status,
  });
  return res.data;
};
