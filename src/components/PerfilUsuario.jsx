import { useEffect, useState } from "react";
import { obtenerRetosPorUsuario } from "../api"; // la crearemos
const userId = "usuario123"; // temporal

function PerfilUsuario() {
  const [retosCreados, setRetosCreados] = useState([]);
  const [retosParticipando, setRetosParticipando] = useState([]);

  const cargarRetos = async () => {
    const data = await obtenerRetosPorUsuario(userId);
    setRetosCreados(data.created);
    setRetosParticipando(data.participating);
  };

  useEffect(() => {
    cargarRetos();
  }, []);

  return (
    <div>
      <h2>👤 Perfil de Usuario</h2>

      <h3>📌 Retos creados por mí</h3>
      <ul>
        {retosCreados.map((reto) => (
          <li key={reto.id}>
            {reto.mode} en {reto.place} el {reto.date} a las {reto.time}
          </li>
        ))}
      </ul>

      <h3>⚽ Retos donde participo</h3>
      <ul>
        {retosParticipando.map((reto) => (
          <li key={reto.id}>
            {reto.mode} en {reto.place} –{" "}
            {reto.confirmed_players?.includes(userId) ? "✅ Confirmado" : "❌ No confirmado"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PerfilUsuario;
