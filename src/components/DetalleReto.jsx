// src/components/DetalleReto.jsx
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  obtenerReto,
  unirseAReto,
  salirDeReto,
  confirmarAsistencia,
  actualizarMatchStatus
} from "../api";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(0, 184, 148, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); }
`;

// Styled Components
const Container = styled.div`
  padding: 1rem 0.75rem 5rem;
  max-width: 600px;
  margin: 0 auto;
  background: var(--bg-primary, #1a1a1a);
  min-height: 100vh;
  color: var(--text-primary, #fff);
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (min-width: 480px) {
    padding: 1.25rem 1rem 5.5rem;
  }
`;

const BackButton = styled.button`
  background: rgba(0, 184, 148, 0.1);
  border: 1px solid rgba(0, 184, 148, 0.2);
  color: var(--accent-green, #00b894);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.6rem 1rem 0.6rem 0.8rem;
  margin: 0 0 1.5rem 0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    background: rgba(0, 184, 148, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &::before {
    content: '←';
    font-size: 1.1em;
    display: inline-block;
    transition: transform 0.2s ease;
  }

  &:hover::before {
    transform: translateX(-2px);
    background: rgba(0, 184, 148, 0.1);
    transform: translateX(-3px);
  }
`;

const Card = styled.div`
  background: var(--bg-card, #2d2d2d);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border, #3a3a3a);
  transition: all 0.25s ease;
  
  @media (min-width: 480px) {
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    border-radius: 16px;
  }
  
  &:hover {
    border-color: var(--accent-green, #00b894);
    box-shadow: 0 4px 16px rgba(0, 184, 148, 0.15);
    transform: translateY(-1px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: ${({ isOpen }) => (isOpen ? '1rem' : '0')};
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary, #fff);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    
    @media (min-width: 480px) {
      font-size: 1.25rem;
    }
  }
  
  span {
    color: var(--text-secondary, #666);
    transition: all 0.3s ease;
    transform: rotate(${({ isOpen }) => (isOpen ? '180deg' : '0')});
    font-size: 0.9rem;
  }
`;

const CardContent = styled.div`
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: ${({ isOpen, maxHeight = '2000px' }) => (isOpen ? maxHeight : '0')};
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  padding: ${({ isOpen }) => (isOpen ? '0.5rem 0.25rem 0.5rem 0.5rem' : '0')};
  margin: 0 0.25rem;
  
  @media (min-width: 480px) {
    padding: ${({ isOpen }) => (isOpen ? '0.5rem 0.5rem 0.5rem 0.75rem' : '0')};
    margin: 0 0.5rem;
  }
`;

// Info box component for the Info section
const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    border-color: rgba(0, 184, 148, 0.2);
    background: rgba(0, 184, 148, 0.03);
  }
  
  .icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #00b894;
    opacity: 0.9;
    display: block;
  }
  
  .label {
    font-size: 0.8rem;
    color: var(--text-secondary, #888);
    margin-bottom: 0.25rem;
    display: block;
  }
  
  .value {
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--text-primary, #fff);
    display: block;
  }
`;

// Match mode badge
const MatchModeBadge = styled.div`
  display: inline-block;
  background: rgba(0, 184, 148, 0.15);
  color: #00b894;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(0, 184, 148, 0.2);
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  // Base button styles are already defined above
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--accent-green, #00b894);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    background: #00a884;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 184, 148, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff5252, #ff3838);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const OutlineButton = styled(Button)`
  background: transparent;
  border: 2px solid var(--accent-green, #00b894);
  color: var(--accent-green, #00b894);
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    background: rgba(0, 184, 148, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 184, 148, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 184, 148, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 184, 148, 0.1), transparent);
    transform: translateX(-100%);
    transition: 0.5s;
  }
  
  &:hover::after {
    transform: translateX(100%);
  }
`;

const PlayerCard = styled.div`
  background: var(--bg-elevated, #3a3a3a);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border, #444);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-green, #00b894);
  }
  
  &.current-user {
    border-left: 4px solid var(--accent-green, #00b894);
    background: linear-gradient(90deg, rgba(0, 184, 148, 0.1), transparent);
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  span {
    font-weight: 500;
    color: var(--text-primary, #fff);
    
    &.organizer {
      font-size: 0.75rem;
      color: var(--accent-green, #00b894);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(0, 184, 148, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      margin-left: 0.5rem;
    }
  }
`;

const PositionBadge = styled.span`
  background: ${({ color }) => color};
  color: white;
  font-size: 0.7rem;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SectionTitle = styled.h3`
  color: var(--accent-green, #00b894);
  margin: 1.75rem 0 1rem 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border, #444), transparent);
  }
  
  span {
    white-space: nowrap;
    padding: 0 0.5rem;
  }
`;

const DangerZone = styled(Card)`
  border-left: 4px solid #ff6b6b;
  margin-top: 2.5rem;
  background: linear-gradient(90deg, rgba(255, 107, 107, 0.05), transparent);
  border: 1px solid rgba(255, 107, 107, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #ff3838);
  }
  
  h2 {
    color: #ff6b6b;
    position: relative;
    padding-left: 1.5rem;
    
    &::before {
      content: '⚠️';
      position: absolute;
      left: -0.5rem;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  
  p {
    color: #ffa8a8;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`;

function DetalleReto({ retoId }) {
  const { usuario } = useUser();
  console.log(usuario)
  const userId = usuario.uid;
  const userName = usuario.displayName;
  const [posicionSeleccionada, setPosicionSeleccionada] = useState("medio");
  const [expandedCard, setExpandedCard] = useState("info");
  // Default to 'local' team selection
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("home");
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [reto, setReto] = useState(null);
  const [loading, setLoading] = useState(true);
  const actualizarPosicion = async () => {
  try {
      const res = await fetch(`http://localhost:8000/matches/${reto.id}/change_position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          position: posicionSeleccionada,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al cambiar posición");
        return;
      }

      cargarReto();
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const cargarReto = async () => {
    try {
      setLoading(true);
      console.log('Fetching reto with ID:', retoId);
      const data = await obtenerReto(retoId);
      console.log('API Response:', data);
      if (data) {
        setReto(data);
      } else {
        console.error('No se recibieron datos del servidor');
        alert('No se pudo cargar la información del partido. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al cargar el reto:', error);
      alert('Error al cargar el partido: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    cargarReto();
  }, [retoId]);
  useEffect(() => {
    if (reto?.status === "cancelled") {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [reto]);
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
    const username = usuario.stats?.username || usuario.displayName;
    await unirseAReto(retoId, userId, username, posicionSeleccionada, equipoSeleccionado);
    await cargarReto();
    setExpandedCard('players'); // Expand players card after joining
  };

  const salir = async () => {
    await salirDeReto(retoId, userId);
    await cargarReto();
    setExpandedCard('join'); // Expand join card after quitting
  };

  const confirmar = async () => {
    await confirmarAsistencia(retoId, userId);
    await cargarReto();
  };
  const estaDentro = reto?.players?.some((j) => j.user_id === userId);
  const estaConfirmado = reto?.players?.some((j) => j.user_id === userId && j.confirmed);
  
  // Set default expanded card based on participation
  useEffect(() => {
    if (reto && expandedCard === null) {
      if (!estaDentro) {
        setExpandedCard('join');
      } else {
        setExpandedCard('details');
      }
    }
  }, [reto, estaDentro, expandedCard]);

  const toggleCard = (cardName) => {
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  const formatLongDateEs = (dateStr) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, (m - 1), d);
      const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const text = fmt.format(date);
      const clean = text.replace(',', '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    } catch {
      return dateStr;
    }
  };

  const positions = [
    { 
      id: 'arquero', 
      icon: '🧤', 
      label: 'Arquero',
      color: '#3498db',
      description: 'Guía la defensa y detén los remates'
    },
    { 
      id: 'defensa', 
      icon: '🛡️', 
      label: 'Defensa',
      color: '#2ecc71',
      description: 'Protege tu portería y inicia el juego'
    },
    { 
      id: 'medio', 
      icon: '⚽', 
      label: 'Medio',
      color: '#f1c40f',
      description: 'Crea juego y conecta defensa con ataque'
    },
    { 
      id: 'delantero', 
      icon: '⚡', 
      label: 'Delantero',
      color: '#e74c3c',
      description: 'Marca goles y desequilibra la defensa rival'
    }
  ];

  const getPositionColor = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    return position ? position.color : '#9b59b6';
  };
  
  const getPositionData = (positionId) => {
    return positions.find(p => p.id === positionId) || positions[0];
  };
  const getMaxPlayers = (mode) => {
    switch (mode) {
      case "5vs5": return 10;
      case "6vs6": return 12;
      case "7vs7": return 14;
      default: return 10;
    }
  };
  // const max_players = getMaxPlayers(reto.mode);
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #00b894',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ color: '#666', marginTop: '1rem' }}>Cargando detalles del partido...</p>
      </div>
    );
  }

  if (!reto) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>No se pudo cargar la información del partido.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#00b894',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }
  // {reto.status === "cancelado" && (
  //   <div style={{
  //     backgroundColor: "#ffcccc",
  //     color: "#a00",
  //     padding: "1rem",
  //     borderRadius: "0.5rem",
  //     marginBottom: "1rem",
  //     fontWeight: "bold"
  //   }}>
  //     🚫 Este reto ha sido cancelado.
  //   </div>
  // )}
  // Debug logs
  console.log("=======================");
  console.log('Current reto state:', reto);
  console.log('Loading state:', loading);
  console.log('Expanded card:', expandedCard);
  const max_players = getMaxPlayers(reto.mode);
  console.log(max_players)
  // Ensure reto data is available
  if (!reto) return null;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => window.history.back()}>
        Volver
      </BackButton>

      {/* Info Card */}
      <Card>
        <CardHeader 
          isOpen={expandedCard === 'info'}
          onClick={() => setExpandedCard(expandedCard === 'info' ? null : 'info')}
        >
          <h2>ℹ️ Info</h2>
          <span>{expandedCard === 'info' ? '▼' : '▶'}</span>
        </CardHeader>
        <CardContent isOpen={expandedCard === 'info'}>
          {/* Match Mode - Larger and more prominent */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            padding: '0.5rem 0'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0, 184, 148, 0.1)',
              color: '#00b894',
              padding: '0.8rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1.3rem',
              fontWeight: '700',
              letterSpacing: '0.5px',
              border: '1px solid rgba(0, 184, 148, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 184, 148, 0.1)'
            }}>
              {reto.mode || 'PARTIDO AMISTOSO'}
            </div>
          </div>
          
          {/* Date Card - Full Width */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1.2rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '0.9rem',
              color: 'var(--text-secondary, #888)',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>📅</span>
              <span>FECHA DEL PARTIDO</span>
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'var(--text-primary, #fff)'
            }}>
              {formatLongDateEs(reto.date)}
            </div>
          </div>
          
          {/* Location - Below Date */}
          <div style={{
            background: 'rgba(0, 184, 148, 0.05)',
            borderLeft: '3px solid #00b894',
            padding: '1rem',
            borderRadius: '0 8px 8px 0',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <div style={{
              background: 'rgba(0, 184, 148, 0.15)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
            </div>
            <div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary, #888)',
                marginBottom: '0.2rem'
              }}>
                UBICACIÓN
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#00b894'
              }}>
                {reto.place}
              </div>
            </div>
          </div>
          
          {/* Info Boxes - 3 in a row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <InfoBox>
              <span className="icon">🕒</span>
              <span className="label">Hora</span>
              <span className="value">{reto.time}</span>
            </InfoBox>
            
            <InfoBox>
              <span className="icon">⏱️</span>
              <span className="label">Duración</span>
              <span className="value">{reto.duration} min</span>
            </InfoBox>
            
            <InfoBox>
              <span className="icon">👥</span>
              <span className="label">Jugadores</span>
              <span className="value">
                {reto.players?.filter(p => p.confirmed).length || 0}
                <span style={{ opacity: 0.6, fontSize: '0.9em' }}>/{max_players}</span>
              </span>
            </InfoBox>
          </div>
        </CardContent>
      </Card>
      
      {/* Notes Card - Only show if notes exist */}
      {reto.notes && (
        <Card>
          <div style={{
            background: 'rgba(241, 196, 15, 0.05)',
            borderLeft: '3px solid #f1c40f',
            padding: '1rem',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.8rem'
          }}>
            <div style={{
              background: 'rgba(241, 196, 15, 0.15)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#f1c40f'
            }}>
              <span>📝</span>
            </div>
            <div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary, #888)',
                marginBottom: '0.2rem'
              }}>
                NOTAS
              </div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '400',
                color: 'var(--text-primary, #fff)'
              }}>
                {reto.notes}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Players Section */}
      <Card>
        <CardHeader 
          isOpen={expandedCard === 'players'}
          onClick={() => setExpandedCard(expandedCard === 'players' ? null : 'players')}
        >
          <h2>👥 Jugadores {reto.players?.filter(p => p.confirmed).length || 0} / {max_players}</h2>
          <span>{expandedCard === 'players' ? '▼' : '▶'}</span>
        </CardHeader>
        
        <CardContent isOpen={expandedCard === 'players'} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '1.25rem',
            position: 'relative',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '0.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}>
            {/* Vertical divider */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '2rem',
              bottom: '0',
              width: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateX(-50%)'
            }} />
            
            {/* Local Team */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: '#3498db',
                fontWeight: '600',
                fontSize: '0.95rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(52, 152, 219, 0.2)'
              }}>
                <span>🏠</span>
                <span>Local</span>
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(52, 152, 219, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#5dade2'
                }}>
                  {reto.players?.filter(p => p.confirmed && p.team === 'home').length}
                </span>
              </div>
              
              {reto.players?.filter(p => p.confirmed && p.team === 'home').length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reto.players
                    .filter(p => p.confirmed && p.team === 'home')
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((player, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.2)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(2px)'
                        }
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          overflow: 'hidden'
                        }}>
                          <span style={{
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {player.name}
                            {player.user_id === reto.creator_id && (
                              <span title="Organizador" style={{
                                color: '#f1c40f',
                                fontSize: '0.8em',
                                display: 'inline-flex',
                                flexShrink: 0
                              }}>👑</span>
                            )}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.8,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(52, 152, 219, 0.15)',
                          color: '#3498db',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          marginLeft: '0.5rem'
                        }}>
                          {getPositionData(player.position)?.label || player.position}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  No hay jugadores locales aún
                </div>
              )}
            </div>

            {/* Visiting Team */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: '#e74c3c',
                fontWeight: '600',
                fontSize: '0.95rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(231, 76, 60, 0.2)'
              }}>
                <span>✈️</span>
                <span>Visitante</span>
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(231, 76, 60, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#e74c3c'
                }}>
                  {reto.players?.filter(p => p.confirmed && p.team === 'away').length}
                </span>
              </div>
              
              {reto.players?.filter(p => p.confirmed && p.team === 'away').length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reto.players
                    .filter(p => p.confirmed && p.team === 'away')
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((player, index) => (
                      <div key={`away-${index}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: 'rgba(231, 76, 60, 0.1)',
                        border: '1px solid rgba(231, 76, 60, 0.2)',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(2px)'
                        }
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          overflow: 'hidden'
                        }}>
                          <span style={{
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {player.name}
                            {player.user_id === reto.creator_id && (
                              <span title="Organizador" style={{
                                color: '#f1c40f',
                                fontSize: '0.8em',
                                display: 'inline-flex',
                                flexShrink: 0
                              }}>👑</span>
                            )}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.8,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(231, 76, 60, 0.15)',
                          color: '#e74c3c',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          marginLeft: '0.5rem'
                        }}>
                          {positions.find(p => p.id === player.position)?.label || player.position}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  No hay jugadores visitantes aún
                </div>
              )}
            </div>
          </div>

          {/* Pending Confirmations */}
          {reto.players?.some(p => !p.confirmed) && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1.5rem 0 0.75rem',
                color: '#f39c12',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                <span>⏳</span>
                <span>Pendientes de confirmar</span>
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(243, 156, 18, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {reto.players?.filter(p => !p.confirmed).length} jugadores
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                padding: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {reto.players
                  .filter(p => !p.confirmed)
                  .map((player, index) => (
                    <div key={`pending-${index}`} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: 0.8
                    }}>
                      <span>👤</span>
                      <span>{player.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Join/Leave Button */}
          <div style={{ marginTop: '0.5rem' }}>
            {!estaDentro ? (
            <div style={{ width: '100%' }}>
              {/* Team Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#aaa',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Selecciona tu equipo:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.6rem',
                  marginBottom: '1rem'
                }}>
                  <div 
                    onClick={() => setEquipoSeleccionado('home')}
                    style={{
                      background: equipoSeleccionado === 'home' 
                        ? 'rgba(52, 152, 219, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${equipoSeleccionado === 'home' ? '#3498db' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '8px',
                      padding: '0.7rem 0.6rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      transform: equipoSeleccionado === 'home' ? 'translateY(-2px)' : 'none',
                      boxShadow: equipoSeleccionado === 'home' ? '0 2px 8px rgba(52, 152, 219, 0.2)' : 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <div style={{
                      color: equipoSeleccionado === 'home' ? '#3498db' : '#fff',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}>
                      <span>🏠</span>
                      <span>Local</span>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setEquipoSeleccionado('away')}
                    style={{
                      background: equipoSeleccionado === 'away' 
                        ? 'rgba(231, 76, 60, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${equipoSeleccionado === 'away' ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '8px',
                      padding: '0.7rem 0.6rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      transform: equipoSeleccionado === 'away' ? 'translateY(-2px)' : 'none',
                      boxShadow: equipoSeleccionado === 'away' ? '0 2px 8px rgba(231, 76, 60, 0.2)' : 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <div style={{
                      color: equipoSeleccionado === 'away' ? '#e74c3c' : '#fff',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}>
                      <span>✈️</span>
                      <span>Visitante</span>
                    </div>
                  </div>
                </div>
                
                {/* Position Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#aaa',
                    marginBottom: '0.6rem',
                    fontWeight: '500'
                  }}>
                    Selecciona tu posición:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.6rem'
                  }}>
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        onClick={() => setPosicionSeleccionada(position.id)}
                        style={{
                          background: posicionSeleccionada === position.id 
                            ? `${position.color}20` 
                            : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${posicionSeleccionada === position.id ? position.color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          padding: '0.7rem 0.6rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          '&:hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <div style={{
                          color: posicionSeleccionada === position.id ? position.color : '#fff',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}>
                          <span>{position.icon}</span>
                          <span>{position.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Join Button */}
                <PrimaryButton 
                  onClick={unirse} 
                  style={{ 
                    width: '100%',
                    marginTop: '0.5rem'
                  }}
                  disabled={!posicionSeleccionada || !equipoSeleccionado}
                >
                  {!posicionSeleccionada || !equipoSeleccionado 
                    ? 'Selecciona equipo y posición' 
                    : 'Unirse al partido'}
                </PrimaryButton>
              </div>
            </div>
          ) : reto.creator_id !== userId && (
              <DangerButton 
                onClick={() => setShowConfirmQuit(true)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.25)';
                }}
              >
                <span style={{ fontSize: '1.1em', opacity: 0.9 }}>❌</span>
                <span style={{ letterSpacing: '0.3px' }}>Salir del partido</span>
              </DangerButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organizer section removed as per requirements */}

      {/* Admin Controls */}
      {reto.creator_id === userId && (
        <DangerZone>
          <CardHeader 
            isOpen={expandedCard === 'admin'}
            onClick={() => setExpandedCard(expandedCard === 'admin' ? null : 'admin')}
          >
            <h2> Zona de Peligro</h2>
          <span>{expandedCard === 'admin' ? '▼' : '▶'}</span>
          {/* <span>▼</span> */}
          </CardHeader>
          
          <CardContent isOpen={expandedCard === 'admin'}>
            <p style={{ color: '#ff6b6b', marginBottom: '1.5rem' }}>
              Estas acciones son permanentes y no se pueden deshacer.
            </p>
            <DangerButton onClick={() => setShowConfirmCancel(true)}>
              🚫 Cancelar partido
            </DangerButton>
          </CardContent>
        </DangerZone>
      )}

      {/* Quit Confirmation Modal */}
      {showConfirmQuit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setShowConfirmQuit(false)}>
          <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ 
              color: '#fff', 
              marginTop: 0,
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '1.25rem'
            }}>
              🚪 Salir del partido
            </h2>
            <p style={{ 
              color: '#aaa', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              ¿Estás seguro de que quieres salir de este partido? Perderás tu cupo.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#3a3a3a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setShowConfirmQuit(false)}
              >
                Cancelar
              </button>
              <button 
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={async () => { 
                  setShowConfirmQuit(false);
                  await salir();
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Match Confirmation Modal */}
      {showConfirmCancel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setShowConfirmCancel(false)}>
          <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ 
              color: '#ff6b6b', 
              marginTop: 0,
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Cancelar partido
            </h2>
            <p style={{ 
              color: '#aaa', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              ¿Estás seguro de que quieres cancelar este partido? Esta acción es permanente y notificará a todos los jugadores.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#3a3a3a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setShowConfirmCancel(false)}
              >
                Volver
              </button>
              <button 
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={async () => { 
                  setShowConfirmCancel(false);
                  await handleCancelarReto();
                }}
              >
                Cancelar partido
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
export default DetalleReto;
