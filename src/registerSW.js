let registration;
let deferredPrompt = null;

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('ServiceWorker registration successful');
          registration = reg;
          
          // Check for updates every hour
          setInterval(() => {
            registration.update().catch(console.error);
          }, 60 * 60 * 1000);
          
          // Handle updates when a new service worker is waiting
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                showUpdateUI();
              }
            });
          });
          
          // Check if the service worker is controlling the page
          if (navigator.serviceWorker.controller) {
            console.log('Service worker is controlling the page');
          } else {
            console.log('Service worker is not controlling the page');
          }
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed: ', err);
        });
      
      // Check if the page is being viewed as a PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running in PWA mode');
        document.documentElement.classList.add('pwa-mode');
      }
      
      // Listen for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default browser install prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        console.log('PWA install prompt available');
        
        // Show the install button if it exists
        const installButton = document.getElementById('installButton');
        if (installButton) {
          installButton.style.display = 'block';
        }
      });
    });
  }
  
  // Listen for the app being installed
  window.addEventListener('appinstalled', (e) => {
    console.log('PWA was installed', e);
    // Hide any install buttons
    const installButton = document.getElementById('installButton');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    // Track the installation
    if (window.gtag) {
      window.gtag('event', 'pwa_installed');
    }
  });
  
  // Listen for offline/online status
  window.addEventListener('online', () => {
    updateOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    updateOnlineStatus(false);
  });
  
  // Initial check
  updateOnlineStatus(navigator.onLine);
}

export function registerPWAInstallPrompt() {
  // Only show install prompt if not running in PWA mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }
  
  let deferredPrompt;
  let installButton = document.getElementById('install-button');
  
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.textContent = 'Instalar App';
    document.body.appendChild(installButton);
  }
  
  // Initially hide the button
  installButton.style.display = 'none';
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    installButton.style.display = 'block';
    
    // Remove any existing click event listeners
    const newInstallButton = installButton.cloneNode(true);
    installButton.parentNode.replaceChild(newInstallButton, installButton);
    installButton = newInstallButton;
    
    // Add click event for the install button
    installButton.addEventListener('click', () => {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        
        // Hide the install button
        installButton.style.display = 'none';
      });
    });
  });
  
  // Hide the install button when the app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
}

// Add PWA update handler
export function registerPWAUpdateHandler() {
  // Check for updates when the page regains focus
  window.addEventListener('focus', checkForUpdates);
  
  // Also check when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForUpdates();
    }
  });
}

// Check for updates
function checkForUpdates() {
  if (registration) {
    registration.update().catch(console.error);
  }
}

// Show update UI when a new version is available
function showUpdateUI() {
  // Create or show update banner
  let updateBanner = document.getElementById('pwa-update-banner');
  
  if (!updateBanner) {
    updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <p>¡Nueva versión disponible!</p>
      <button id="update-button">Actualizar</button>
    `;
    document.body.appendChild(updateBanner);
    
    // Add click handler for update button
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
      updateButton.addEventListener('click', () => {
        if (registration && registration.waiting) {
          // Tell the service worker to skip waiting and activate
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        updateBanner.remove();
        // Reload the page to use the new service worker
        window.location.reload();
      });
    }
  }
}

// Update online status indicator
function updateOnlineStatus(online) {
  const offlineIndicator = document.getElementById('offline-indicator');
  
  if (online) {
    if (offlineIndicator) {
      offlineIndicator.style.display = 'none';
    }
    // You could also show a "back online" message here
  } else {
    if (!offlineIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'offline-indicator';
      indicator.textContent = 'Sin conexión. Verificando cambios...';
      document.body.appendChild(indicator);
    } else {
      offlineIndicator.style.display = 'block';
    }
  }
}
