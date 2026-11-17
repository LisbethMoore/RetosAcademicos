import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import RutaProtegida from "./components/RutaProtegida";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Jugar from "./pages/Jugar";
import Retos from "./pages/Retos";
import CrearReto from "./pages/CrearReto";
import EditarReto from "./pages/EditarReto";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* solo jugadores con sesión */}
          <Route element={<RutaProtegida rol="jugador" />}>
            <Route path="/jugar" element={<Jugar />} />
          </Route>

          {/* solo el administrador */}
          <Route element={<RutaProtegida rol="administrador" />}>
            <Route path="/retos" element={<Retos />} />
            <Route path="/crear" element={<CrearReto />} />
            <Route path="/editar/:id" element={<EditarReto />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
