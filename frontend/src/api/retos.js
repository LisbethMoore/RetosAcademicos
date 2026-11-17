import axios from "./axios";

// todos=true trae también los retos desactivados (vista del administrador)
export const obtenerRetos = (nivel) =>
  axios.get("/retos", { params: { todos: true, nivel: nivel || undefined } });
export const obtenerRetoPorId = (id) => axios.get(`/retos/${id}`);
export const crearReto = (data) => axios.post("/retos", data);
export const actualizarReto = (id, data) => axios.put(`/retos/${id}`, data);
export const eliminarReto = (id) => axios.delete(`/retos/${id}`);
export const cambiarEstadoReto = (id, activo) => axios.patch(`/retos/${id}/estado`, { activo });

export { mensajeError } from "./axios";
