import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './App.css';
import './pwa-styles.css';
import './styles/InstallButton.css';
import DetalleReto from './components/DetalleReto';
import { UserProvider } from './context/UserContext';
import { useParams } from 'react-router-dom';
import { registerSW } from './registerSW';

// Register service worker and PWA functionality
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    registerSW();
  }
}

// Wrapper component for DetalleReto with route params
function DetalleRetoWrapper() {
  const { retoId } = useParams();
  return <DetalleReto retoId={retoId} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={
            <App />
          } />
          <Route path="/retos/:retoId" element={<DetalleRetoWrapper />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);