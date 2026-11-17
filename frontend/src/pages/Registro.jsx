import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/forms.css";

// Cada nivel académico juega con retos de un nivel
const niveles = [
  { valor: "Primaria", texto: "Primaria" },
  { valor: "Secundaria", texto: "Secundaria" },
  { valor: "Universitario", texto: "Universidad" },
];

export default function Registro() {
  const { usuario, registro } = useAuth();
  const [datos, setDatos] = useState({ nombre: "", usuario: "", contrasena: "", nivelAcademico: "Primaria" });
  const [error, setError] = useState("");

  // al registrarse queda con la sesión iniciada y va a jugar
  if (usuario) return <Navigate to={usuario.rol === "administrador" ? "/retos" : "/jugar"} replace />;

  const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorApi = await registro(datos);
    if (errorApi) setError(errorApi);
  };

  return (
    <main className="container angosto tarjeta-acceso">
      <div className="emoji">🎢</div>
      <h2>Registro de jugador</h2>
      <p>Crea tu cuenta y súbete a la montaña rusa.</p>
      <form onSubmit={handleSubmit} className="formulario">
        <label htmlFor="nombre">Nombre:</label>
        <input id="nombre" name="nombre" value={datos.nombre} onChange={handleChange} required />

        <label htmlFor="usuario">Usuario (sin espacios):</label>
        <input id="usuario" name="usuario" autoComplete="username" value={datos.usuario} onChange={handleChange} required />

        <label htmlFor="contrasena">Contraseña:</label>
        <input id="contrasena" name="contrasena" type="password" autoComplete="new-password" minLength={4} value={datos.contrasena} onChange={handleChange} required />

        <label htmlFor="nivelAcademico">Nivel académico:</label>
        <select id="nivelAcademico" name="nivelAcademico" value={datos.nivelAcademico} onChange={handleChange}>
          {niveles.map((n) => (
            <option key={n.valor} value={n.valor}>{n.texto}</option>
          ))}
        </select>

        {error && <p className="error">{error}</p>}

        <button type="submit">Registrarme</button>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </main>
  );
}
