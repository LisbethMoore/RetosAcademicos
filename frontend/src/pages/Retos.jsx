import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerRetos, eliminarReto, cambiarEstadoReto, mensajeError } from "../api/retos";
import RetoCard from "../components/RetoCard";

export default function Retos() {
  const [retos, setRetos] = useState([]);
  const [nivel, setNivel] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    obtenerRetos(nivel)
      .then((res) => {
        setRetos(res.data.retos);
        setError("");
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [nivel]);

  const handleEdit = (id) => {
    navigate(`/editar/${id}`);
  };

  const handleDelete = async (reto) => {
    if (!confirm(`¿Eliminar el reto "${reto.contenido.titulo}"?`)) return;
    try {
      await eliminarReto(reto._id);
      setRetos(retos.filter((r) => r._id !== reto._id));
      setError("");
    } catch (err) {
      // si el reto ya tiene respuestas la API no deja borrarlo
      setError(mensajeError(err));
    }
  };

  const handleToggle = async (reto) => {
    try {
      const res = await cambiarEstadoReto(reto._id, !reto.clasificacion.activo);
      const actualizado = res.data.reto;
      setRetos(retos.map((r) => (r._id === actualizado._id ? actualizado : r)));
      setError("");
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  const texto = busqueda.trim().toLowerCase();
  const filtrados = retos.filter((r) =>
    `${r.contenido.titulo} ${r.contenido.enunciado}`.toLowerCase().includes(texto)
  );

  return (
    <main className="container">
      <div className="encabezado-pagina">
        <h2 className="titulo-sobre-fondo">Banco de retos</h2>
        <button onClick={() => navigate("/crear")}>+ Nuevo reto</button>
      </div>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por título o enunciado"
          aria-label="Buscar reto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select aria-label="Filtrar por nivel" value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="">Todos los niveles</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          <p className="total">{filtrados.length} retos</p>
          {filtrados.length === 0 && <p>No hay retos para mostrar.</p>}
          <div className="grilla">
            {filtrados.map((reto) => (
              <RetoCard
                key={reto._id}
                reto={reto}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
