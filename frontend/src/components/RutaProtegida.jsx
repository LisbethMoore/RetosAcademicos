import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Solo deja entrar si hay sesión (y, si se indica, con el rol correcto)
export default function RutaProtegida({ rol }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <main className="container"><p>Cargando...</p></main>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;

  return <Outlet />;
}
