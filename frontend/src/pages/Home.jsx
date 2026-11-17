import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { usuario } = useAuth();

  return (
    <main className="container">
      <section className="hero">
        <div>
          <h1>Aprende física subido en una montaña rusa</h1>
          <p>
            Mientras el carrito avanza aparecen preguntas de física: velocidad, energía, fuerzas y más.
            En cada partida los retos salen al azar, según tu nivel. ¡Si aciertas sumas puntos y si te
            equivocas aprendes con la explicación!
          </p>
          <div className="card-acciones">
            {!usuario && <Link className="boton" to="/registro">Quiero jugar</Link>}
            {!usuario && <Link className="boton secundario" to="/login">Ya tengo cuenta</Link>}
            {usuario?.rol === "jugador" && <Link className="boton" to="/jugar">🎢 Ir a jugar</Link>}
            {usuario?.rol === "administrador" && <Link className="boton" to="/retos">Administrar retos</Link>}
          </div>
        </div>
        <img className="mascota" src="/mascota.webp" alt="La mascota de la Uniautónoma subida en el carrito de la montaña rusa" />
      </section>

      <section className="niveles">
        <div className="card nivel-card">
          <div className="icono">🎒</div>
          <h3>Primaria</h3>
          <span className="etiqueta nivel-Básico">Retos Básicos</span>
          <p>Velocidad, distancia, tiempo y fuerzas.</p>
        </div>
        <div className="card nivel-card">
          <div className="icono">📐</div>
          <h3>Secundaria</h3>
          <span className="etiqueta nivel-Intermedio">Retos Intermedios</span>
          <p>Aceleración, energía, trabajo y potencia.</p>
        </div>
        <div className="card nivel-card">
          <div className="icono">🎓</div>
          <h3>Universidad</h3>
          <span className="etiqueta nivel-Avanzado">Retos Avanzados</span>
          <p>Rizos, fuerza centrípeta y conservación de la energía.</p>
        </div>
      </section>
    </main>
  );
}
