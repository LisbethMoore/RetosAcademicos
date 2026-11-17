import IlustracionReto from "./IlustracionReto";

export default function RetoCard({ reto, onEdit, onDelete, onToggle }) {
  const { contenido, clasificacion } = reto;

  return (
    <div className={`card ${clasificacion.activo ? "" : "card-inactiva"}`}>
      <IlustracionReto reto={reto} pequena />
      <div className="card-etiquetas">
        <span className={`etiqueta nivel-${clasificacion.nivel}`}>{clasificacion.nivel}</span>
        <span className={`etiqueta ${clasificacion.activo ? "activo" : "inactivo"}`}>
          {clasificacion.activo ? "Activo" : "Inactivo"}
        </span>
      </div>
      <h3>{contenido.titulo}</h3>
      <p className="enunciado-corto">{contenido.enunciado}</p>
      <div className="card-acciones">
        <button className="pequeno" onClick={() => onEdit(reto._id)}>Editar</button>
        <button className="secundario pequeno" onClick={() => onToggle(reto)}>
          {clasificacion.activo ? "Desactivar" : "Activar"}
        </button>
        <button className="peligro pequeno" onClick={() => onDelete(reto)}>Eliminar</button>
      </div>
    </div>
  );
}
