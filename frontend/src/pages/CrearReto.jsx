import { useNavigate } from "react-router-dom";
import { crearReto, mensajeError } from "../api/retos";
import RetoForm from "../components/RetoForm";

export default function CrearReto() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await crearReto(data);
      navigate("/retos");
    } catch (err) {
      return mensajeError(err);
    }
  };

  return (
    <main className="container">
      <h2 className="titulo-sobre-fondo">Nuevo reto</h2>
      <RetoForm onSubmit={handleSubmit} />
    </main>
  );
}
