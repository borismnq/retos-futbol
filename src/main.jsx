import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DetalleReto from "./components/DetalleReto";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/retos/:retoId" element={<DetalleRetoWrapper />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// Wrapper necesario para extraer el ID de la URL
import { useParams } from "react-router-dom";
// import DetalleReto from "./components/DetalleReto";

function DetalleRetoWrapper() {
  const { retoId } = useParams();
  return <DetalleReto retoId={retoId} />;
}
