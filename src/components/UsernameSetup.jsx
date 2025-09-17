import { useState } from "react";
import { api } from "../api";

const UsernameSetup = ({ user, onUsernameSet }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateUsername = (username) => {
    // Username validation: only alphanumeric and underscore, 3-20 characters
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUsername(username)) {
      setError("El nombre de usuario debe tener entre 3-20 caracteres y solo puede contener letras, números y guiones bajos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/users/initstats", {
        username: username.toLowerCase(),
        user_id: user.uid,
        photo_url: user.photoURL
      });

      // Fetch the complete user stats after creation
      try {
        const statsResponse = await api.get(`/users/${username.toLowerCase()}/stats`);
        onUsernameSet({
          ...user,
          username: username.toLowerCase(),
          stats: statsResponse.data
        });
      } catch (statsErr) {
        console.error("Error fetching user stats after creation:", statsErr);
        // Fallback to initstats response
        onUsernameSet({
          ...user,
          username: username.toLowerCase(),
          stats: response.data
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Este nombre de usuario ya está en uso. Por favor elige otro.");
      } else {
        setError("Error al crear el perfil. Por favor intenta de nuevo.");
      }
      console.error("Error creating user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">⚽ Configura tu perfil</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Elige un nombre de usuario único para tu perfil de fútbol
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de usuario</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: futbolero123"
              disabled={loading}
              autoFocus
            />
            {error && <div className="form-error">{error}</div>}
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Solo letras, números y guiones bajos (3-20 caracteres)
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !username.trim()}
            style={{ width: "100%" }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
                Creando perfil...
              </>
            ) : (
              "Crear perfil"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;
