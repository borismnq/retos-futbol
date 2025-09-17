import { useEffect } from 'react';

const SplashScreen = () => {
  useEffect(() => {
    // Hide splash screen after the app is loaded
    const splash = document.getElementById('splash');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
        }, 300);
      }, 1000);
    }
  }, []);

  return (
    <div
      id="splash"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <img 
          src="/pwa-192x192.png" 
          alt="Retos Fútbol" 
          style={{ width: '120px', height: '120px', marginBottom: '20px' }}
        />
        <h1 style={{ color: '#fff', margin: 0 }}>Retos Fútbol</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
