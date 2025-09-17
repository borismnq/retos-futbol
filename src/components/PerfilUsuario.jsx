import { useEffect, useState } from "react";
import { obtenerRetosPorUsuario } from "../api";

function PerfilUsuario({ user }) {  
  const [retosCreados, setRetosCreados] = useState([]);
  const [retosParticipando, setRetosParticipando] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarRetos = async () => {
    try {
      const data = await obtenerRetosPorUsuario(user.uid);
      setRetosCreados(data.created || []);
      setRetosParticipando(data.participating || []);
    } catch (error) {
      console.error("Error loading user matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      cargarRetos();
    }
  }, [user?.uid]);

  if (!user) {
    return null;
  }

  const stats = user.stats || {};

  return (
    <div>
      {/* User Profile Header */}
      <div className="card">
        <div className="profile-header">
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2>{user.displayName}</h2>
            {user.username && (
              <p className="profile-username">@{user.username}</p>
            )}
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* User Stats */}
        {stats.user_id && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⚽</div>
              <span className="stat-value">{stats.matches_played || 0}</span>
              <span className="stat-label">Partidos</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <span className="stat-value">{stats.wins || 0}</span>
              <span className="stat-label">Victorias</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🤝</div>
              <span className="stat-value">{stats.draws || 0}</span>
              <span className="stat-label">Empates</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">😞</div>
              <span className="stat-value">{stats.loses || 0}</span>
              <span className="stat-label">Derrotas</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <span className="stat-value">{stats.rank || 0}</span>
              <span className="stat-label">Ranking</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <span className="stat-value">{stats.stars || 0}</span>
              <span className="stat-label">Estrellas</span>
            </div>
            {/* <div className="stat-card">
              <span className="stat-value">{stats.pref_position || "N/A"}</span>
              <span className="stat-label">Posición</span>
            </div> */}
          </div>
        )}
      </div>

    </div>
  );
}

export default PerfilUsuario;
