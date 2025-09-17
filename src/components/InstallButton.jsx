import { useEffect, useRef, useState } from 'react';
import { setupInstallPrompt, isPWAInstallable, isRunningStandalone, isSecureContext } from '../utils/installPWA';
import '../styles/InstallButton.css';

const InstallButton = () => {
  const buttonRef = useRef(null);
  const [showUnsecureWarning, setShowUnsecureWarning] = useState(false);
  
  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const secure = isSecureContext();
    
    if (!secure) {
      setShowUnsecureWarning(true);
      return;
    }
    
    // Only set up the install prompt if PWA is installable and not already running as PWA
    if (isPWAInstallable() && !isRunningStandalone()) {
      setupInstallPrompt(buttonRef.current);
    } else if (buttonRef.current) {
      buttonRef.current.style.display = 'none';
    }
  }, []);

  if (showUnsecureWarning) {
    return (
      <div className="install-warning">
        <p>Para instalar la aplicación, por favor accede a través de HTTPS o localhost.</p>
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      id="installButton"
      className="install-button"
      aria-label="Instalar aplicación"
      title="Instalar aplicación"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="install-icon">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      </svg>
      <span>Instalar App</span>
    </button>
  );
};

export default InstallButton;
