import { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { useUser } from './context/UserContext';
import { isRunningStandalone, isPWAInstallable } from './utils/installPWA';
import ListaRetos from './components/ListaRetos';
import PerfilUsuario from './components/PerfilUsuario';
import LoginGoogle from './components/LoginGoogle';
import UsernameSetup from './components/UsernameSetup';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import InstallButton from './components/InstallButton';

// Install icon SVG
const InstallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

// Add viewport meta tag for mobile
const setViewport = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
  }
};

function App() {
  const { usuario, setUsuario } = useUser();
  const [activeTab, setActiveTab] = useState("matches");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setViewport();
    
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    
      // Add PWA mode class if running in standalone mode
    if (isRunningStandalone()) {
      document.documentElement.classList.add('pwa-mode');
    }
    
    // Log PWA installability
    if (isPWAInstallable()) {
      console.log('PWA installation is supported');
    }

    return () => clearTimeout(timer);
  }, []);

  const handleUsernameSet = (userWithStats) => {
    setUsuario(userWithStats);
  };

  const renderContent = () => {
    if (!usuario) {
      return (
        <div className="app-content">
          <LoginGoogle />
        </div>
      );
    }

    // Show username setup modal if user doesn't have username
    if (!usuario.username) {
      return (
        <>
          <div className="app-content">
            <LoginGoogle />
          </div>
          <UsernameSetup user={usuario} onUsernameSet={handleUsernameSet} />
        </>
      );
    }

    // Show main app content based on active tab
    return (
      <>
        <div className="app-content">
          {activeTab === "matches" && <ListaRetos user={usuario} />}
          {activeTab === "profile" && <PerfilUsuario user={usuario} />}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  };

  return (
    <div className="app-container">
      {showSplash && <SplashScreen />}
      <div style={{ display: showSplash ? 'none' : 'block' }}>
        <header className="app-header">
          <h1 className="app-title">⚽ Retos de Fútbol</h1>
          {usuario && (
            <button 
              onClick={async () => {
                try {
                  const auth = getAuth(getApp());
                  await signOut(auth);
                  setUsuario(null);
                } catch (error) {
                  console.error("Error during logout:", error);
                  // Force logout even if Firebase signOut fails
                  setUsuario(null);
                }
              }}
              className="logout-btn"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              ➜]
            </button>
          )}
        </header>
        {renderContent()}
        
        {/* PWA Install Button */}
        <InstallButton />
        
        {/* PWA Update Notification */}
        <div id="pwa-update-notification" className="pwa-toast">
          <div className="pwa-toast-content">
            <strong>¡Actualización disponible!</strong>
            <p>Hay una nueva versión de la aplicación. Por favor, actualiza para obtener las últimas características.</p>
          </div>
          <button className="pwa-toast-close" aria-label="Cerrar">&times;</button>
        </div>
      </div>
    </div>
  );
}

export default App;
