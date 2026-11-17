import axios from "./axios";

// No se manda el usuario: la API lo saca de la sesión
export const iniciarPartida = (totalPreguntas) => axios.post("/partidas", { totalPreguntas });
export const obtenerMisPartidas = () => axios.get("/partidas");
export const responderReto = (data) => axios.post("/respuestas", data);
