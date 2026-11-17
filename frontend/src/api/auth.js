import axios from "./axios";

export const registroRequest = (data) => axios.post("/auth/registro", data);
export const loginRequest = (data) => axios.post("/auth/login", data);
export const logoutRequest = () => axios.post("/auth/logout");
export const perfilRequest = () => axios.get("/auth/perfil");
