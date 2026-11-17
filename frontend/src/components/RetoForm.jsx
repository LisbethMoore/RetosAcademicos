import { useState } from "react";
import "../styles/forms.css";
import IlustracionReto from "./IlustracionReto";
import { comprimirImagen } from "../utils/imagen";

// El reto en MongoDB tiene objetos anidados; el formulario trabaja con campos planos
function aFormulario(reto) {
  return {
    titulo: reto?.contenido?.titulo || "",
    enunciado: reto?.contenido?.enunciado || "",
    imagen: reto?.contenido?.imagen || "",
    tipoDePregunta: reto?.clasificacion?.tipoDePregunta || "Selección múltiple",
    nivel: reto?.clasificacion?.nivel || "Básico",
    opciones: reto?.respuesta?.opciones || ["", "", "", ""],
    indiceCorrecto: reto?.respuesta?.indiceCorrecto ?? 0,
    retroAcierto: reto?.retroalimentacion?.retroAcierto || "",
    retroError: reto?.retroalimentacion?.retroError || "",
  };
}

function aReto(form) {
  return {
    contenido: { titulo: form.titulo, enunciado: form.enunciado, imagen: form.imagen },
    clasificacion: { tipoDePregunta: form.tipoDePregunta, nivel: form.nivel },
    respuesta: { opciones: form.opciones.map((o) => o.trim()), indiceCorrecto: form.indiceCorrecto },
    retroalimentacion: { retroAcierto: form.retroAcierto, retroError: form.retroError },
  };
}

export default function RetoForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(aFormulario(initialData));
  const [error, setError] = useState("");
  const [cargandoImagen, setCargandoImagen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // el administrador escoge un archivo; se comprime y se guarda como texto dentro del reto
  const seleccionarImagen = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = ""; // permite volver a escoger el mismo archivo
    if (!archivo) return;
    setCargandoImagen(true);
    try {
      const imagen = await comprimirImagen(archivo);
      setFormData((datos) => ({ ...datos, imagen }));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoImagen(false);
    }
  };

  const cambiarOpcion = (indice, valor) => {
    const opciones = [...formData.opciones];
    opciones[indice] = valor;
    setFormData({ ...formData, opciones });
  };

  const agregarOpcion = () => {
    setFormData({ ...formData, opciones: [...formData.opciones, ""] });
  };

  const quitarOpcion = (indice) => {
    const opciones = formData.opciones.filter((_, i) => i !== indice);
    // si se quita la opción correcta o una anterior, el índice correcto se corre
    let indiceCorrecto = formData.indiceCorrecto;
    if (indice === indiceCorrecto) indiceCorrecto = 0;
    else if (indice < indiceCorrecto) indiceCorrecto--;
    setFormData({ ...formData, opciones, indiceCorrecto });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limpias = formData.opciones.map((o) => o.trim());
    if (new Set(limpias).size !== limpias.length) {
      setError("Las opciones no se pueden repetir");
      return;
    }
    setError("");
    // onSubmit devuelve el mensaje de error de la API, si hubo
    const errorApi = await onSubmit(aReto(formData));
    if (errorApi) setError(errorApi);
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <label htmlFor="titulo">Título:</label>
      <input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />

      <label htmlFor="enunciado">Enunciado:</label>
      <textarea id="enunciado" name="enunciado" rows="3" value={formData.enunciado} onChange={handleChange} required />

      <span className="etiqueta-campo">Imagen (opcional):</span>
      <div className="campo-imagen">
        <div className="vista-imagen">
          <IlustracionReto key={formData.imagen} reto={{ contenido: { titulo: formData.titulo, enunciado: formData.enunciado, imagen: formData.imagen } }} pequena />
        </div>
        <div className="botones-imagen">
          <label className="boton secundario" htmlFor="imagen">
            {cargandoImagen ? "Cargando..." : formData.imagen ? "🖼️ Cambiar imagen" : "🖼️ Seleccionar imagen"}
          </label>
          <input id="imagen" type="file" accept="image/png, image/jpeg, image/webp" onChange={seleccionarImagen} className="oculto" />
          {formData.imagen && (
            <button type="button" className="secundario" onClick={() => setFormData({ ...formData, imagen: "" })}>
              Quitar imagen
            </button>
          )}
          <p className="ayuda">
            JPG, PNG o WebP. Si no pones imagen, el juego dibuja una escena de la montaña rusa según el tema de la pregunta.
          </p>
        </div>
      </div>

      <div className="fila">
        <div>
          <label htmlFor="nivel">Nivel:</label>
          <select id="nivel" name="nivel" value={formData.nivel} onChange={handleChange}>
            <option value="Básico">Básico (primaria)</option>
            <option value="Intermedio">Intermedio (secundaria)</option>
            <option value="Avanzado">Avanzado (universidad)</option>
          </select>
        </div>
        <div>
          <label htmlFor="tipoDePregunta">Tipo de pregunta:</label>
          <input id="tipoDePregunta" name="tipoDePregunta" value={formData.tipoDePregunta} onChange={handleChange} required />
        </div>
      </div>

      <fieldset>
        <legend>Opciones (marca la correcta)</legend>
        {formData.opciones.map((opcion, i) => (
          <div className="opcion" key={i}>
            <input
              type="radio"
              name="indiceCorrecto"
              aria-label={`Opción ${i + 1} es la correcta`}
              checked={formData.indiceCorrecto === i}
              onChange={() => setFormData({ ...formData, indiceCorrecto: i })}
            />
            <input
              value={opcion}
              placeholder={`Opción ${i + 1}`}
              onChange={(e) => cambiarOpcion(i, e.target.value)}
              required
            />
            <button type="button" className="secundario" onClick={() => quitarOpcion(i)} disabled={formData.opciones.length <= 2}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" className="secundario" onClick={agregarOpcion}>+ Agregar opción</button>
      </fieldset>

      <label htmlFor="retroAcierto">Mensaje si acierta:</label>
      <textarea id="retroAcierto" name="retroAcierto" rows="2" value={formData.retroAcierto} onChange={handleChange} required />

      <label htmlFor="retroError">Mensaje si se equivoca:</label>
      <textarea id="retroError" name="retroError" rows="2" value={formData.retroError} onChange={handleChange} required />

      {error && <p className="error">{error}</p>}

      <button type="submit">Guardar</button>
    </form>
  );
}
