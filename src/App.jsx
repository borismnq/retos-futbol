import ListaRetos from "./components/ListaRetos";
import FormularioCrearReto from "./components/FormularioCrearReto";
import PerfilUsuario from "./components/PerfilUsuario";

function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h1>⚽️ App de Retos de Fútbol</h1>
      {/* <FormularioCrearReto /> */}
      <PerfilUsuario />
      <ListaRetos />
    </div>
  );
}

export default App;
