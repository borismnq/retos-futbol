import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { getApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useUser } from "../context/UserContext";

const LoginGoogle = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth(getApp());
  const navigate = useNavigate();
  const { setUsuario } = useUser();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        checkUserProfile(firebaseUser);
      } else {
        // Clear user context when Firebase auth state is null
        setUsuario(null);
      }
    });
    return () => unsubscribe();
  }, [auth, setUsuario]);

  // In development, the proxy will handle the API requests to localhost:8000
  // In production, update this to your production API URL if needed
  const API_BASE_URL = '';

  const checkUserProfile = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await api.post(`/auth/login`, {
        idToken,
      });

      const userData = response.data;
      
      if (userData.username) {
        // User has username, fetch their stats
        try {
          const statsResponse = await api.get(`/users/${userData.username}/stats`);
          setUsuario({
            ...firebaseUser,
            username: userData.username,
            stats: statsResponse.data
          });
        } catch (err) {
          console.error("Error fetching user stats:", err);
          setUsuario(firebaseUser);
        }
      } else {
        // User needs to set username
        setUsuario(firebaseUser);
      }
    } catch (err) {
      console.error("Error checking user profile:", err);
      setUsuario(firebaseUser);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      await checkUserProfile(result.user);
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
      } else {
        console.error("Login failed", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUsuario(null); // 👈 también lo quitamos del contexto
    navigate("/"); // 👈 puedes cambiar a "/login" si prefieres
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">⚽</div>
      <h1 className="welcome-title">Bienvenido a Retos de Fútbol</h1>
      <p className="welcome-description">
        Conecta con otros jugadores, crea partidos y disfruta del fútbol en tu ciudad
      </p>
      <button 
        onClick={handleLogin} 
        className="btn btn-primary"
        disabled={loading}
        style={{ fontSize: "1.1rem", padding: "1.25rem 2rem" }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: "20px", height: "20px" }}></div>
            Iniciando sesión...
          </>
        ) : (
          <>
            <span>🔐</span>
            Iniciar sesión con Google
          </>
        )}
      </button>
    </div>
  );
};

export default LoginGoogle;
