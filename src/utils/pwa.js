// PWA installation and update handling
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          type: 'module',
        });

        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(console.error);
        }, 60 * 60 * 1000);

        // Handle updates when a new service worker is waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            // When the new service worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
            
            // When the new service worker is activated
            if (newWorker.state === 'activated') {
              console.log('New service worker activated');
              // Optionally notify the user that the app has been updated
              showToast('¡Aplicación actualizada!', 'La aplicación se ha actualizado a la última versión.');
            }
          });
        });

        // Check if the page is being viewed as a PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
          console.log('Running in PWA mode');
          document.documentElement.classList.add('pwa-mode');
        }

      } catch (error) {
        console.error('ServiceWorker registration failed: ', error);
      }
    });
  }
}

// Show update notification to the user
function showUpdateNotification() {
  const updateDialog = document.createElement('div');
  updateDialog.className = 'pwa-update-dialog';
  updateDialog.innerHTML = `
    <div class="pwa-update-content">
      <h3>¡Nueva actualización disponible!</h3>
      <p>Hay una nueva versión de la aplicación disponible. ¿Deseas actualizar ahora?</p>
      <div class="pwa-update-actions">
        <button id="update-later" class="pwa-button secondary">Ahora no</button>
        <button id="update-now" class="pwa-button primary">Actualizar ahora</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateDialog);
  
  // Add event listeners
  document.getElementById('update-now').addEventListener('click', () => {
    // Tell the service worker to skip waiting and reload the page
    const worker = navigator.serviceWorker.controller;
    if (worker) {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
    updateDialog.remove();
    window.location.reload();
  });
  
  document.getElementById('update-later').addEventListener('click', () => {
    updateDialog.remove();
  });
}

// Show a toast notification
function showToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'pwa-toast';
  toast.innerHTML = `
    <div class="pwa-toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
    <button class="pwa-toast-close">&times;</button>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
  
  // Close button
  toast.querySelector('.pwa-toast-close').addEventListener('click', () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  });
}

// Handle the app installed event
if ('onappinstalled' in window) {
  window.addEventListener('appinstalled', (event) => {
    console.log('App was installed', event);
    showToast('¡Aplicación instalada!', 'Puedes acceder a la aplicación desde tu pantalla de inicio.');
  });
}

// Handle the beforeinstallprompt event to show custom install button
let deferredPrompt;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', async () => {
        // Hide the app provided install promotion
        installButton.style.display = 'none';
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
      });
    }
  });
}

// Check if the app is running in standalone mode
export function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
}

// Initialize PWA features
export function initPWA() {
  registerServiceWorker();
  setupInstallPrompt();
  
  // Add a class to the html element if running in standalone mode
  if (isRunningStandalone()) {
    document.documentElement.classList.add('pwa-mode');
  }
  
  // Listen for network status changes
  window.addEventListener('online', () => {
    showToast('¡Conexión restablecida!', 'Ya estás conectado a internet.');
  });
  
  window.addEventListener('offline', () => {
    showToast('Sin conexión', 'Estás en modo sin conexión. Algunas funciones pueden no estar disponibles.');
  });
  
  // Initial check
  if (!navigator.onLine) {
    showToast('Modo sin conexión', 'Estás en modo sin conexión. Algunas funciones pueden no estar disponibles.');
  }
}
