// src/components/DetalleReto.jsx
import { useEffect, useState } from "react";
import {
  obtenerReto,
  unirseAReto,
  salirDeReto,
  confirmarAsistencia,
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

  // const yaUnido = reto.players?.some(j => j.user_id === userId);
  // console.log(yaUnido)

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

      <h3>Jugadores ({reto.players?.length || 0})</h3>
      <ul>
        {reto.players?.map((j, idx) => (
          <li key={idx}>
            {j.name} {j.confirmed ? "✅" : "⏳"}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "1rem" }}>
        {!estaDentro && <button onClick={unirse}>⚽ Unirme</button>}
        {estaDentro && (
          <>
            {!estaConfirmado && <button onClick={confirmar}>✅ Confirmar</button>}
            <button onClick={salir}>❌ Salir</button>
          </>
        )}
      </div>
      
    </div>
  );
  // return (
  //   <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
  //     <h2>{reto.mode} en {reto.place}</h2>
  //     <p>{reto.date} a las {reto.time} — {reto.duration} min</p>
  //     <p><strong>Estado:</strong> {reto.status}</p>

  //     <h3>Jugadores ({reto.players?.length || 0})</h3>
  //     <ul>
  //       {reto.players?.map(j => (
  //         <li key={j.user_id}>
  //           {j.name} {j.confirmed ? "✅" : "❌"}
  //         </li>
  //       ))}
  //     </ul>

  //     <div style={{ marginTop: "1rem" }}>
  //       {yaUnido ? (
  //         <>
  //           <button onClick={salir}>❌ Salir</button>{" "}
  //           <button onClick={confirmar}>✅ Confirmar</button>
  //         </>
  //       ) : (
  //         <button onClick={unirse}>⚽ Unirse al reto</button>
  //       )}
  //     </div>
  //   </div>
  // );
}

export default DetalleReto;
