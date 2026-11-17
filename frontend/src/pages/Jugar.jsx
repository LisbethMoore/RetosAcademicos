import { useEffect, useState } from "react";
import { iniciarPartida, obtenerMisPartidas, responderReto } from "../api/partidas";
import { mensajeError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import IlustracionReto from "../components/IlustracionReto";
import { formatoFecha } from "../utils/fechas";

const nivelDeRetos = { Primaria: "Básico", Secundaria: "Intermedio", Universitario: "Avanzado" };
const letras = ["A", "B", "C", "D", "E", "F"];

function estrellas(porcentaje) {
  const n = porcentaje >= 80 ? 3 : porcentaje >= 50 ? 2 : porcentaje > 0 ? 1 : 0;
  return "★".repeat(n) + "☆".repeat(3 - n);
}

export default function Jugar() {
  const { usuario } = useAuth();
  const [cantidad, setCantidad] = useState(5);
  const [partida, setPartida] = useState(null);
  const [retos, setRetos] = useState([]);
  const [indice, setIndice] = useState(0);
  const [resultado, setResultado] = useState(null);   // respuesta de la API al último reto
  const [inicioReto, setInicioReto] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cargarHistorial = () => {
    obtenerMisPartidas()
      .then((res) => setHistorial(res.data.partidas))
      .catch((err) => setError(mensajeError(err)));
  };

  useEffect(cargarHistorial, []);

  const empezar = async () => {
    try {
      // no se envía el usuario: la API sabe quién es por la sesión
      const res = await iniciarPartida(cantidad);
      setPartida(res.data.partida);
      setRetos(res.data.retos);
      setIndice(0);
      setResultado(null);
      setInicioReto(Date.now());
      setError("");
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  const responder = async (opcion) => {
    // el tiempo que tardó se mide aquí, pero la FECHA la pone el servidor
    const segundos = Math.max(0.1, Math.round((Date.now() - inicioReto) / 100) / 10);
    setEnviando(true);
    try {
      const res = await responderReto({
        partidaId: partida._id,
        retoId: retos[indice]._id,
        respuesta: opcion,
        tiempoRespuesta: segundos,
      });
      setResultado({ ...res.data, elegida: opcion });
      setPartida(res.data.partida);
      setError("");
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const siguiente = () => {
    setIndice(indice + 1);
    setResultado(null);
    setInicioReto(Date.now());
  };

  const salir = () => {
    setPartida(null);
    setRetos([]);
    setResultado(null);
    cargarHistorial();
  };

  // ---------------- Pantalla de inicio ----------------
  if (!partida) {
    return (
      <main className="container">
        <div className="card bienvenida">
          <div>
            <h2>¡Hola, {usuario.nombre}! 👋</h2>
            <p>
              Te saldrán retos de física al azar de tu nivel{" "}
              <span className={`etiqueta nivel-${nivelDeRetos[usuario.nivelAcademico]}`}>
                {nivelDeRetos[usuario.nivelAcademico]}
              </span>
              . Cada acierto vale 10 puntos.
            </p>
            <div className="selector-cantidad">
              <span className="titulo">Preguntas:</span>
              {[3, 5, 6, 10].map((n) => (
                <button
                  key={n}
                  className={cantidad === n ? "" : "secundario"}
                  onClick={() => setCantidad(n)}
                  aria-pressed={cantidad === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button onClick={empezar}>🎢 Empezar partida</button>
        </div>
        {error && <p className="error">{error}</p>}

        <section className="seccion">
          <h2>Mis partidas</h2>
          {historial.length === 0 ? (
            <p>Todavía no has jugado. ¡Súbete a la montaña rusa!</p>
          ) : (
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th><th>Puntos</th><th>Aciertos</th><th>Errores</th>
                    <th>% aciertos</th><th>Tiempo (s)</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((p) => (
                    <tr key={p._id}>
                      <td className="fecha">{formatoFecha(p.fechaInicio)}</td>
                      <td>{p.puntuacion}</td>
                      <td>{p.aciertos}</td>
                      <td>{p.errores}</td>
                      <td>{p.porcentajeAciertos}%</td>
                      <td>{Math.round(p.tiempoTotal * 10) / 10}</td>
                      <td>{p.aciertos + p.errores >= p.totalPreguntas ? "✅ Terminada" : "⏸️ Sin terminar"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    );
  }

  // ---------------- Partida en curso ----------------
  const reto = retos[indice];
  const terminada = resultado && indice === retos.length - 1;

  return (
    <main className="container">
      <div className="marcador">
        <div>Pregunta {indice + 1} de {retos.length}</div>
        <div>⭐ {partida.puntuacion} puntos</div>
        <div>✅ {partida.aciertos}</div>
        <div>❌ {partida.errores}</div>
      </div>

      {!terminada && (
        <div className="card">
          <div className="pregunta">
            <IlustracionReto reto={reto} />
            <div>
              <div className="card-etiquetas">
                <span className={`etiqueta nivel-${reto.clasificacion.nivel}`}>{reto.clasificacion.nivel}</span>
              </div>
              <h3>{reto.contenido.titulo}</h3>
              <p className="enunciado">{reto.contenido.enunciado}</p>
            </div>
          </div>

          <div className="opciones-juego">
            {reto.respuesta.opciones.map((opcion, i) => {
              let clase = "opcion-juego";
              if (resultado && opcion === resultado.elegida) clase += resultado.correcta ? " acierto" : " fallo";
              return (
                <button key={opcion} className={clase} disabled={!!resultado || enviando} onClick={() => responder(opcion)}>
                  <span className="letra">{letras[i]}</span>
                  {opcion}
                </button>
              );
            })}
          </div>

          {resultado && (
            <p className={resultado.correcta ? "mensaje-acierto" : "error"}>{resultado.retroalimentacion}</p>
          )}
          {error && <p className="error">{error}</p>}

          {resultado && (
            <div className="acciones-juego">
              <button onClick={siguiente}>Siguiente reto →</button>
            </div>
          )}
        </div>
      )}

      {terminada && (
        <div className="card resumen">
          <img className="mascota" src="/mascota-final.webp" alt="La mascota de la Uniautónoma con el pulgar arriba" />
          <h2>¡Llegaste a la meta! 🏁</h2>
          <p className={resultado.correcta ? "mensaje-acierto" : "error"}>{resultado.retroalimentacion}</p>
          <div className="estrellas">{estrellas(partida.porcentajeAciertos)}</div>
          <div className="puntos">{partida.puntuacion}</div>
          <p>puntos</p>
          <p>
            Aciertos: <strong>{partida.aciertos}</strong> · Errores: <strong>{partida.errores}</strong> ·{" "}
            <strong>{partida.porcentajeAciertos}%</strong> de aciertos
          </p>
          <p className="fecha">Partida terminada el {formatoFecha(partida.fechaFin)}</p>
          <div className="card-acciones" style={{ justifyContent: "center" }}>
            <button onClick={salir}>Volver</button>
          </div>
        </div>
      )}
    </main>
  );
}
