import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header>
      <div className="container header-contenido">
        <Link to="/" className="logo">🎢 Retos <span>Académicos</span></Link>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          {!usuario && <NavLink to="/login">Iniciar sesión</NavLink>}
          {!usuario && <NavLink to="/registro">Registro</NavLink>}
          {usuario?.rol === "jugador" && <NavLink to="/jugar">Jugar</NavLink>}
          {usuario?.rol === "administrador" && <NavLink to="/retos">Retos</NavLink>}
          {usuario?.rol === "administrador" && <NavLink to="/crear">Nuevo reto</NavLink>}
          {usuario && (
            <span className="sesion">
              <span>
                {usuario.nombre} <small>({usuario.rol})</small>
              </span>
              <button className="secundario pequeno" onClick={cerrarSesion}>Salir</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
