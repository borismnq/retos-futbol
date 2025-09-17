// This file is used to register the service worker in the browser
// It's called from the main application entry point

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update().catch(console.error);
          }, 60 * 60 * 1000);
          
          // Track the installing worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              // When the new service worker is installed and waiting
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification(registration);
              }
              
              // When the new service worker is activated
              if (newWorker.state === 'activated') {
                console.log('New service worker activated');
                // Optionally notify the user that the app has been updated
                showToast('¡Aplicación actualizada!', 'La aplicación se ha actualizado a la última versión.');
              }
            });
          });
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });
  }
}

// Show update notification to the user
function showUpdateNotification(registration) {
  const updateDialog = document.createElement('div');
  updateDialog.className = 'pwa-update-dialog';
  updateDialog.innerHTML = `
    <div class="pwa-update-content">
      <h3>¡Nueva actualización disponible!</h3>
      <p>Hay una nueva versión de la aplicación. ¿Deseas actualizar ahora?</p>
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
    const worker = registration.waiting;
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
  toast.className = 'pwa-toast show';
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

// Listen for the controlling service worker changing and refresh the page
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}

// Handle network status changes
if (navigator.onLine !== undefined) {
  window.addEventListener('online', () => {
    showToast('¡Conexión restablecida!', 'Estás conectado a internet.');
  });

  window.addEventListener('offline', () => {
    showToast('Sin conexión', 'Estás en modo sin conexión. Algunas funciones pueden no estar disponibles.');
  });
}
