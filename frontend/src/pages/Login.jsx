import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/forms.css";

export default function Login() {
  const { usuario, login } = useAuth();
  const [datos, setDatos] = useState({ usuario: "", contrasena: "" });
  const [error, setError] = useState("");

  // si ya inició sesión, va directo a su pantalla
  if (usuario) return <Navigate to={usuario.rol === "administrador" ? "/retos" : "/jugar"} replace />;

  const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorApi = await login(datos);
    if (errorApi) setError(errorApi);
  };

  return (
    <main className="container angosto tarjeta-acceso">
      <div className="emoji">🎟️</div>
      <h2>Iniciar sesión</h2>
      <p>Entra con tu usuario para seguir jugando.</p>
      <form onSubmit={handleSubmit} className="formulario">
        <label htmlFor="usuario">Usuario:</label>
        <input id="usuario" name="usuario" autoComplete="username" value={datos.usuario} onChange={handleChange} required />

        <label htmlFor="contrasena">Contraseña:</label>
        <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" value={datos.contrasena} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}

        <button type="submit">Entrar</button>
        <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </form>
    </main>
  );
}
