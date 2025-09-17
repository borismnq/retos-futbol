import { useState } from "react";
import { crearReto } from "../api";

function FormularioCrearReto({ onRetoCreado, userId, userName }) {
  const [form, setForm] = useState({
    mode: "5vs5",
    place: "",
    date: "",
    time: "",
    duration: 60,
  });
  const [creatorPosition, setCreatorPosition] = useState("medio");
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({}); // limpia errores al escribir
  };

  const validar = () => {
    const errores = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.place || form.place.length < 3) errores.place = "Debe tener al menos 3 caracteres";
    if (!form.date) errores.date = "La fecha es requerida";
    else if (form.date < hoy) errores.date = "La fecha no puede ser en el pasado";
    if (!form.time) errores.time = "La hora es requerida";
    if (!form.duration || form.duration <= 0) errores.duration = "La duración debe ser mayor a 0";

    return errores;
  };

  const crearRetoSubmit = async (e) => {
    e.preventDefault();
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) {
      setErrores(validaciones);
      return;
    }

    setLoading(true);
    try {
      const nuevo = {
        ...form,
        duration: parseInt(form.duration),
        creator_id: userId,
        creator_name: userName,
        creator_position: creatorPosition,
      };

      await crearReto(nuevo);
      setForm({ mode: "5vs5", place: "", date: "", time: "", duration: 60 });
      if (onRetoCreado) onRetoCreado();
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Error al crear el partido. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <form onSubmit={crearRetoSubmit}>
      <div className="form-group">
        <label className="form-label">Modo de juego</label>
        <select 
          name="mode" 
          value={form.mode} 
          onChange={handleChange}
          className="form-input"
        >
          <option value="5vs5">⚽ 5 vs 5 (10 jugadores)</option>
          <option value="6vs6">⚽ 6 vs 6 (12 jugadores)</option>
          <option value="7vs7">⚽ 7 vs 7 (14 jugadores)</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">📍 Lugar del partido</label>
        <input 
          type="text" 
          name="place" 
          value={form.place} 
          onChange={handleChange}
          className="form-input"
          placeholder="ej: Cancha Municipal, Parque Central..."
        />
        {errores.place && <div className="form-error">⚠️ {errores.place}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">🗓️ Fecha</label>
          <input 
            type="date" 
            name="date" 
            value={form.date} 
            onChange={handleChange}
            className="form-input"
          />
          {errores.date && <div className="form-error">⚠️ {errores.date}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">🕐 Hora</label>
          <input 
            type="time" 
            name="time" 
            value={form.time} 
            onChange={handleChange}
            className="form-input"
            step="600"
          />
          {errores.time && <div className="form-error">⚠️ {errores.time}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tu posición (creador)</label>
        <div className="position-buttons">
          {[
            { id: 'arquero', icon: '🧤', label: 'Arquero' },
            { id: 'defensa', icon: '🛡️', label: 'Defensa' },
            { id: 'medio', icon: '🎯', label: 'Medio' },
            { id: 'delantero', icon: '⚡', label: 'Delantero' }
          ].map((pos) => (
            <button
              key={pos.id}
              type="button"
              className={`position-btn sm ${creatorPosition === pos.id ? 'selected' : ''}`}
              onClick={() => setCreatorPosition(pos.id)}
            >
              <span className="position-btn-icon">{pos.icon}</span>
              <span className="position-btn-label">{pos.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">⏱️ Duración (minutos)</label>
        <input 
          type="number" 
          name="duration" 
          value={form.duration} 
          onChange={handleChange}
          className="form-input"
          min="30"
          max="180"
          step="15"
          placeholder="90"
        />
        {errores.duration && <div className="form-error">⚠️ {errores.duration}</div>}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
            Creando partido...
          </>
        ) : (
          "⚽ Crear Partido"
        )}
      </button>
    </form>
  );
}

export default FormularioCrearReto;
