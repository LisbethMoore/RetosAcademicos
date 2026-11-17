import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerRetoPorId, actualizarReto, mensajeError } from "../api/retos";
import RetoForm from "../components/RetoForm";

export default function EditarReto() {
  const { id } = useParams();
  const [reto, setReto] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerRetoPorId(id)
      .then((res) => setReto(res.data.reto))
      .catch((err) => setError(mensajeError(err)));
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await actualizarReto(id, data);
      navigate("/retos");
    } catch (err) {
      return mensajeError(err);
    }
  };

  if (error) return <main className="container"><p className="error">{error}</p></main>;
  if (!reto) return <main className="container"><p>Cargando...</p></main>;

  return (
    <main className="container">
      <h2 className="titulo-sobre-fondo">Editar reto</h2>
      <RetoForm initialData={reto} onSubmit={handleSubmit} />
    </main>
  );
}
