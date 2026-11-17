import axios from "axios";

// Instancia de Axios para toda la app: withCredentials hace que el navegador
// envíe la cookie de la sesión (el token) en cada petición a la API.
const instancia = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export default instancia;

// La API responde los errores como { message: "..." }
export const mensajeError = (error) =>
  error.response?.data?.message || "No se pudo conectar con la API. ¿Está corriendo en el puerto 3000?";
