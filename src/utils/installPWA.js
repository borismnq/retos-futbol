// Handle PWA installation
let deferredPrompt = null;
let installButton = null;

// Setup the install prompt
export function setupInstallPrompt(button) {
  if (button) {
    installButton = button;
    installButton.style.display = 'none';
    
    installButton.addEventListener('click', showInstallPrompt);
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button if it exists
    if (installButton) {
      installButton.style.display = 'block';
    }
    
    // Log that the prompt is available
    console.log('PWA install prompt available');
  });
  
  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installButton) {
      installButton.style.display = 'none';
    }
    deferredPrompt = null;
  });
}

// Show the install prompt
export function showInstallPrompt() {
  if (!deferredPrompt) {
    console.log('No deferred prompt available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Reset the deferred prompt variable
    deferredPrompt = null;
  });
}

// Check if the app is installed
export function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://') ||
         window.location.search.includes('from-homescreen');
}

// Check if the app is running in standalone mode
export function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('from-homescreen')
  );
}

// Check if the browser supports PWA installation
export function isPWAInstallable() {
  return 'BeforeInstallPromptEvent' in window;
}

// Check if the current context is secure (HTTPS or localhost)
export function isSecureContext() {
  return window.isSecureContext || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

// Log PWA support status for debugging
export function logPWASupport() {
  console.log('PWA Support Status:', {
    isSecureContext: isSecureContext(),
    isPWAInstallable: isPWAInstallable(),
    isRunningStandalone: isRunningStandalone(),
    userAgent: navigator.userAgent
  });
}

// Show a toast notification
function showToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'pwa-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `
    <div class="pwa-toast-content">
      <div class="pwa-toast-message">
        <strong>${title}</strong>
        <span>${message}</span>
      </div>
      <button class="pwa-toast-close" aria-label="Cerrar">×</button>
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
