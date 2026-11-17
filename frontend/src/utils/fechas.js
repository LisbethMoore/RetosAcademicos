// Las fechas llegan de la API en UTC (las pone el servidor).
// Aquí solo se muestran en la hora de Colombia, así se ven igual sin importar
// en qué servidor o zona horaria esté corriendo cada parte.
const formato = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

export const formatoFecha = (fecha) => (fecha ? formato.format(new Date(fecha)) : "—");
