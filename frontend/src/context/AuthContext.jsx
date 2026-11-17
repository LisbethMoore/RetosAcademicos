import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, logoutRequest, perfilRequest, registroRequest } from "../api/auth";
import { mensajeError } from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Guarda quién tiene la sesión iniciada y lo comparte con toda la app.
// El token está en una cookie httpOnly: el frontend no lo lee, solo le pregunta
// a la API quién es el usuario (perfil). Cada navegador (o ventana de incógnito)
// tiene sus propias cookies, por eso se pueden tener dos usuarios a la vez.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir o recargar la página se revisa si ya hay una sesión
  useEffect(() => {
    perfilRequest()
      .then((res) => setUsuario(res.data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  // Devuelven el mensaje de error, o null si todo salió bien
  const login = async (datos) => {
    try {
      const res = await loginRequest(datos);
      setUsuario(res.data.usuario);
      return null;
    } catch (err) {
      return mensajeError(err);
    }
  };

  const registro = async (datos) => {
    try {
      const res = await registroRequest(datos);
      setUsuario(res.data.usuario);
      return null;
    } catch (err) {
      return mensajeError(err);
    }
  };

  const logout = async () => {
    await logoutRequest().catch(() => {});
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
