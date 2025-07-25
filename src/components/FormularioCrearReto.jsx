// src/components/FormularioCrearReto.jsx
import { useState } from "react";
// import { addDoc, collection } from "firebase/firestore";
import { crearReto } from "../api";

// import { db } fro  m "../firebase";

function FormularioCrearReto({ onRetoCreado, userId = "usuario123" }) {
  const [form, setForm] = useState({
    mode: "5vs5",
    place: "",
    date: "",
    time: "",
    duration: 60,
  });
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({}); // limpia errores al escribir
  };
  const validar = () => {
    const errores = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.place || form.place.length < 3) errores.place = "Debe tener al menos 3 letras";
    if (!form.date) errores.date = "Requerida";
    else if (form.date < hoy) errores.date = "No puede ser pasada";
    if (!form.time) errores.time = "Requerida";
    if (!form.duration || form.duration <= 0) errores.duration = "Debe ser mayor a 0";

    return errores;
  };
  const crearRetoSubmit = async (e) => {
    e.preventDefault();
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) {
      setErrores(validaciones);
      return;
    }

    const nuevo = {
      ...form,
      duration: parseInt(form.duration),
      creator_id: userId,
    };

    await crearReto(nuevo);
    setForm({ mode: "5vs5", place: "", date: "", time: "", duration: 60 });
    alert("✅ Reto creado");
    if (onRetoCreado) onRetoCreado();
  };

  // const crearReto = async (e) => {
  //   e.preventDefault();
  //   const validaciones = validar();
  //   if (Object.keys(validaciones).length > 0) {
  //     setErrores(validaciones);
  //     return;
  //   }
  //   const retoNuevo = {
  //     ...form,
  //     duration: parseInt(form.duration),
  //     status: "open",
  //     creator_id: userId,
  //     players: [
  //       {
  //           id: userId,
  //           confirmado: true,
  //       },
  //     ],
  //     creado_en: new Date(),
  //   };

  //   await addDoc(collection(db, "Matches"), retoNuevo);
  //   setForm({ mode: "5vs5", place: "", date: "", time: "", duration: 60 });
  //   alert("✅ Reto creado");
  // };

  return (
    <form onSubmit={crearRetoSubmit} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
      <h3>➕ Crear nuevo reto</h3>

      <label>
        Modo:
        <select name="mode" value={form.mode} onChange={handleChange}>
          <option value="5vs5">5 vs 5</option>
          <option value="6vs6">6 vs 6</option>
          <option value="7vs7">7 vs 7</option>
        </select>
      </label><br /><br />

      <label>
        Lugar:
        <input type="text" name="place" value={form.place} onChange={handleChange} />
        {errores.place && <span style={{ color: "red" }}> ⚠ {errores.place}</span>}
      </label><br /><br />

      <label>
        Fecha:
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        {errores.date && <span style={{ color: "red" }}> ⚠ {errores.date}</span>}
      </label><br /><br />

      <label>
        Hora:
        <input type="time" name="time" value={form.time} onChange={handleChange} />
        {errores.time && <span style={{ color: "red" }}> ⚠ {errores.time}</span>}
      </label><br /><br />

      <label>
        Duración (minutos):
        <input type="number" name="duration" value={form.duration} onChange={handleChange} />
        {errores.duration && <span style={{ color: "red" }}> ⚠ {errores.duration}</span>}
      </label><br /><br />

      <button type="submit" style={{ marginTop: "1rem" }}>Crear reto</button>
    </form>
  );
}

export default FormularioCrearReto;
