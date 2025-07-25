// src/api.js
import axios from "axios";

const API_URL = "http://localhost:8000"; // Cambia si usas otra URL

// Obtener todos los retos
export const obtenerRetos = async () => {
  const res = await axios.get(`${API_URL}/matches`);
  return res.data;
};

// Obtener detalle de un reto
export const obtenerReto = async (id) => {
  const res = await axios.get(`${API_URL}/matches/${id}`);
  return res.data;
};

// Crear un nuevo reto
export const crearReto = async (reto) => {
  const res = await axios.post(`${API_URL}/matches`, reto);
  return res.data;
};

// Unirse a un reto
export const unirseAReto = async (id, userId) => {
  const res = await axios.post(`${API_URL}/matches/${id}/join`, { user_id: userId, name: "testname" });
  return res.data;
};

// Salir de un reto
export const salirDeReto = async (id, userId) => {
  console.log(userId)
  console.log({ user_id: userId })
  const res = await axios.post(`${API_URL}/matches/${id}/quit`, userId);
  return res.data;
};

// Confirmar asistencia
export const confirmarAsistencia = async (id, userId) => {
  const res = await axios.post(`${API_URL}/matches/${id}/confirm`, userId);
  return res.data;
};

export const obtenerRetosPorUsuario = async (userId) => {
  const res = await fetch(`${API_URL}/users/${userId}/matches`);
  return await res.json();
};

export const actualizarMatchStatus = async (id, userId, status) => {
  const res = await fetch(`${API_URL}/matches/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      status: status
    })
  });
  return await res.json();
};