// src/components/ListaRetos.jsx
import { useEffect, useState } from "react";
import { obtenerRetos } from "../api";
import { Link } from "react-router-dom";
import FormularioCrearReto from "./FormularioCrearReto"; // Asegúrate que se importe si está aquí

function ListaRetos() {
  const [retos, setRetos] = useState([]);
  const fetchRetos = async () => {
    const data = await obtenerRetos();
    setRetos(data);
  };
  useEffect(() => {
    fetchRetos();
  }, []);
  console.log("===========");
  console.log(retos);
  return (
    <div>
      <h2>📋 Lista de Retos</h2>
      <FormularioCrearReto onRetoCreado={fetchRetos} />
      <ul>
        {retos.map((reto) => (
          <li key={reto.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
              <Link to={`/retos/${reto.id}`} style={{ textDecoration: "none", color: "black" }}>
                  <strong>{reto.mode}</strong> — {reto.place}<br />
                  {reto.date} a las {reto.time}<br />
                  Jugadores: {reto.players?.length || 0} / {reto.mode === "5vs5" ? 10 : reto.mode === "6vs6" ? 12 : 14}<br />
                  Estado: <em>{reto.status}</em>
              </Link>
          </li>
        ))}
      </ul>
    </div>
    // <div>
    //   <h2>🏆 Retos activos</h2>
    //   {retos.length === 0 ? (
    //     <p>No hay retos disponibles</p>
    //   ) : (
    //     <ul>
    //       {retos.map((reto) => (
    //         <li key={reto.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
    //             <Link to={`/retos/${reto.id}`} style={{ textDecoration: "none", color: "black" }}>
    //                 <strong>{reto.mode}</strong> — {reto.place}<br />
    //                 {reto.date} a las {reto.time}<br />
    //                 Jugadores: {reto.players?.length || 0} / {reto.mode === "5vs5" ? 10 : reto.mode === "6vs6" ? 12 : 14}<br />
    //                 Estado: <em>{reto.status}</em>
    //             </Link>
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    // </div>
  );
}

export default ListaRetos;
