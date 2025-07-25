// src/components/DetalleReto.jsx
import { useEffect, useState } from "react";
import {
  obtenerReto,
  unirseAReto,
  salirDeReto,
  confirmarAsistencia,
  actualizarMatchStatus
} from "../api";

function DetalleReto({ retoId, userId = "usuario123" }) {
  const [reto, setReto] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarReto = async () => {
    const data = await obtenerReto(retoId);
    setReto(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarReto();
  }, [retoId]);

  const handleCancelarReto = async () => {
    try {
      await actualizarMatchStatus(retoId, userId, "cancelled")
      alert("Reto cancelado");
      await cargarReto(); // o router.navigate() si vuelves a la lista
    } catch (err) {
      console.error("Error cancelando reto", err);
    }
  };
  const unirse = async () => {
    await unirseAReto(retoId, userId);
    await cargarReto();
  };

  const salir = async () => {
    await salirDeReto(retoId, userId);
    await cargarReto();
  };

  const confirmar = async () => {
    await confirmarAsistencia(retoId, userId);
    await cargarReto();
  };
  console.log("===== ESTA DENTRO =====")
  console.log(userId)
  // console.log(reto.players)
  const estaDentro = reto?.players?.some((j) => j.user_id === userId);
  console.log(estaDentro)
  const estaConfirmado = reto?.players?.some((j) => j.user_id === userId && j.confirmed);
  console.log(estaConfirmado)
  if (loading) return <p>Cargando...</p>;
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h2>⚽ Reto {reto.mode}</h2>
      <p>
        <strong>Lugar:</strong> {reto.place}<br />
        <strong>Fecha:</strong> {reto.date} a las {reto.time}<br />
        <strong>Duración:</strong> {reto.duration} minutos<br />
        <strong>Estado:</strong> {reto.status}<br />
      </p>
      <p>
        Estado:{" "}
        <span
          style={{
            color:
              reto.status === "cancelled"
                ? "red"
                : reto.status === "confirmed"
                ? "green"
                : reto.status === "completed"
                ? "gray"
                : "blue", // abierto o default
            fontWeight: "bold",
          }}
        >
          {reto.status?.toUpperCase()}
        </span>
      </p>

      <h3>Jugadores ({reto.players?.length || 0})</h3>
      <p>
        Confirmados: {reto.players?.filter(p => p.confirmed).length || 0} / {reto.players?.length || 0}
      </p>
      <ul>
        {reto.players?.map((player) => (
          <li key={player.user_id}>
            {player.name} - {player.confirmed ? "✅ Confirmado" : "❌ No confirmado"}
          </li>
        ))}
      </ul>
      {reto.status !== "cancelled" && (
        <div style={{ marginTop: "1rem" }}>
          {!estaDentro && <button onClick={unirse}>⚽ Unirme</button>}
          {estaDentro && (
            <>
              {!estaConfirmado && <button onClick={confirmar}>✅ Confirmar</button>}
              <button onClick={salir}>❌ Salir</button>
            </>
          )}
        </div>
      )}
        {reto.creator_id === userId && reto.status !== "cancelled" && (
          <button
            onClick={handleCancelarReto}
            style={{ marginTop: "1rem", backgroundColor: "red", color: "white" }}
          >
            Cancelar reto
          </button>
        )}
    </div>
  );
 
}

export default DetalleReto;
