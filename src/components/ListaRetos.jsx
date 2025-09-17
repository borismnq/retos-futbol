import { useEffect, useState } from "react";
import { obtenerRetos } from "../api";
import { Link, useNavigate } from "react-router-dom";
import FormularioCrearReto from "./FormularioCrearReto";

function ListaRetos({ user }) {
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const fetchRetos = async () => {
    try {
      const data = await obtenerRetos();
      setRetos(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetos();
  }, []);

  const handleRetoCreado = () => {
    fetchRetos();
    setShowCreateForm(false);
  };

  const getMaxPlayers = (mode) => {
    switch (mode) {
      case "5vs5": return 10;
      case "6vs6": return 12;
      case "7vs7": return 14;
      default: return 10;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#00d084"; // Brighter green for active
      case "full": return "#ff9f43";   // Orange for full
      case "completed": return "#576574"; // Gray for completed
      case "cancelled": return "#ff6b6b"; // Red for cancelled
      default: return "#a4b0be";        // Light gray for unknown
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Activo";
      case "full": return "Completo";
      case "completed": return "Finalizado";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Header with CTA */}
      <div style={{ 
        background: '#2d2d2d', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        marginBottom: '1.5rem',
        border: '1px solid #3a3a3a',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {!showCreateForm ? (
          <div style={{ textAlign: 'center' }}>
            {/* <h1 style={{ 
              color: '#fff', 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.75rem',
              fontWeight: '600'
            }}>
              Retos de Fútbol
            </h1> */}
            <p style={{ 
              color: '#ccc', 
              marginBottom: '1rem', 
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              ¿Listo para jugar? Únete a un partido o crea uno nuevo
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              style={{
                background: '#00b894',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#00a884'}
              onMouseOut={(e) => e.target.style.background = '#00b894'}
            >
              ➕ Crear Nuevo Partido
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#fff', 
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Crear Nuevo Partido
              </h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#ccc',
                  borderRadius: '6px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
                onMouseOver={(e) => {
                  e.target.background = '#3a3a3a';
                  e.target.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.background = 'transparent';
                  e.target.color = '#ccc';
                }}
              >
                ✕ Cancelar
              </button>
            </div>
            <FormularioCrearReto 
              onRetoCreado={handleRetoCreado} 
              userId={user.uid} 
              userName={user.stats?.username || user.displayName} 
            />
          </div>
        )}
      </div>

      {/* Matches List */}
      {retos.length > 0 ? (
        <ul className="matches-list" style={{ 
          padding: '0',
          listStyle: 'none',
          display: 'grid',
          gap: '1rem',
          margin: '0',
          width: '100%'
        }}>
          {retos
            .slice()
            .sort((a, b) => {
              // First sort by participation (user's matches first)
              const participatesA = (a.players || []).some(p => p.user_id === user.uid);
              const participatesB = (b.players || []).some(p => p.user_id === user.uid);
              
              if (participatesA !== participatesB) {
                return participatesA ? -1 : 1;
              }
              
              // Secondary sort: earlier date/time first
              const dateA = new Date(`${a.date}T${(a.time || '00:00')}`);
              const dateB = new Date(`${b.date}T${(b.time || '00:00')}`);
              return dateA - dateB;
            })
            .map((reto) => {
              const maxPlayers = getMaxPlayers(reto.mode);
              const currentPlayers = reto.players?.length || 0;
              const spotsLeft = maxPlayers - currentPlayers;
              let foundUser = null;
              for (const player of reto.players || []) {
                if (player.user_id === user.uid) {
                  foundUser = user;
                  break; // stop once found
                }
              }
              const userParticipates = foundUser !== null;

              return (
                <li 
                  key={reto.id} 
                  className={`match-item ${userParticipates ? 'user-participating' : ''}`}
                  onClick={() => navigate(`/retos/${reto.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="match-item-content">
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {/* Match Name */}
                      <h3 style={{
                        margin: '0',
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        lineHeight: '1.3',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: '700',
                          fontSize: '1.1rem',
                          color: 'var(--text-primary)'
                        }}>
                          {reto.mode || '5vs5'}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          color: 'var(--accent-green)',
                          marginLeft: 'auto'
                        }}>
                          <span>{currentPlayers}</span>
                          <span style={{ opacity: 0.5 }}>/</span>
                          <span>{maxPlayers}</span>
                        </div>
                      </h3>

                      {/* Status & Participation */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: '500'
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: userParticipates ? 'var(--accent-green)' : 'var(--available)',
                              boxShadow: userParticipates ? '0 0 8px var(--accent-green)' : 'none'
                            }}></span>
                            {userParticipates ? 'Participando' : 'Disponible'}
                          </span>
                        </div>

                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          background: getStatusColor(reto.status) + '10',
                          color: getStatusColor(reto.status),
                          border: `1px solid ${getStatusColor(reto.status)}20`,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {reto.status === 'active' && (
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: getStatusColor(reto.status),
                              animation: 'pulse 2s infinite'
                            }}></span>
                          )}
                          {getStatusText(reto.status || 'active')}
                        </span>
                      </div>

                      {/* Match Details */}
                      <div style={{ 
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        marginBottom: '1rem',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.75rem'
                        }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'rgba(0, 208, 132, 0.1)',
                                color: 'var(--accent-green)',
                                fontSize: '0.9rem'
                              }}>
                                📅
                              </span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                              }}>
                                Fecha y Hora
                              </span>
                            </div>
                            <div style={{
                              marginLeft: '2.5rem',
                              lineHeight: '1.3'
                            }}>
                              <p style={{
                                margin: '0',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                {new Date(reto.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                              <p style={{
                                margin: '0.1rem 0 0 0',
                                fontWeight: '500',
                                color: 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                opacity: 0.9
                              }}>
                                {reto.time ? (
                                  new Date(`2000-01-01T${reto.time}`).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })
                                ) : 'Hora por definir'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'rgba(0, 208, 132, 0.1)',
                                color: 'var(--accent-green)',
                                fontSize: '0.9rem'
                              }}>
                                📍
                              </span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                              }}>
                                Lugar
                              </span>
                            </div>
                            <div style={{
                              marginLeft: '2.5rem',
                              lineHeight: '1.3'
                            }}>
                              <p style={{
                                margin: '0',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                {reto.place || 'Ubicación no especificada'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
            marginBottom: '1rem',
            opacity: '0.8'
          }}>⚽</div>
          <h3 style={{
            color: '#fff',
            margin: '0 0 0.5rem 0',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>No hay partidos disponibles</h3>
          <p style={{
            color: '#aaa',
            margin: '0 0 1.5rem 0',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            ¡Sé el primero en crear un partido y empezar a jugar!
          </p>
          {!showCreateForm && (
            <button 
              onClick={() => setShowCreateForm(true)}
              style={{
                background: '#00b894',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#00a884'}
              onMouseOut={(e) => e.target.style.background = '#00b894'}
            >
              ➕ Crear Primer Partido
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button for quick match creation */}
      {!showCreateForm && (
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fab"
          title="Crear nuevo partido"
        >
          ➕
        </button>
      )}
    </div>
  );
}

export default ListaRetos;
