import { useState } from "react";

// Si el reto tiene imagen (URL) se muestra esa; si no, o si no carga,
// se dibuja una escena de la montaña rusa según el tema de la pregunta.

function escenaDelReto(reto) {
  const texto = `${reto.contenido.titulo} ${reto.contenido.enunciado}`.toLowerCase();
  if (/rizo|loop|centr[ií]peta|curva/.test(texto)) return "rizo";
  if (/choque|frenad|frena|impulso|momento/.test(texto)) return "choque";
  if (/cae|ca[ií]da|baja|bajada|altura|potencial|pendiente|inclinad/.test(texto)) return "caida";
  if (/recta|t[uú]nel|tramo|distancia|unidad|tiempo|velocidad media/.test(texto)) return "recta";
  return "colina";
}

function Carrito({ x, y, angulo = 0, color = "#FF5A36" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angulo})`}>
      <circle cx="0" cy="-27" r="6" fill="#FFD7B5" />
      <rect x="-18" y="-22" width="36" height="16" rx="5" fill={color} />
      <rect x="-18" y="-22" width="36" height="5" rx="2" fill="#FFC23C" />
      <circle cx="-10" cy="-4" r="4" fill="#1B1F3B" />
      <circle cx="10" cy="-4" r="4" fill="#1B1F3B" />
    </g>
  );
}

const vias = {
  colina: "M0 132 C 60 132, 95 42, 160 42 S 255 132, 320 132",
  caida: "M0 36 C 70 36, 110 36, 175 132 L 320 132",
  recta: "M0 124 L 320 124",
  choque: "M0 128 L 320 128",
};

function Escena({ tipo }) {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="Ilustración del reto en la montaña rusa">
      <defs>
        <linearGradient id={`cielo-${tipo}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3C7" />
          <stop offset="1" stopColor="#FFF6EC" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill={`url(#cielo-${tipo})`} />
      <circle cx="270" cy="34" r="16" fill="#FFC23C" opacity="0.9" />
      <g fill="#fff" opacity="0.9">
        <ellipse cx="60" cy="30" rx="22" ry="8" />
        <ellipse cx="78" cy="26" rx="14" ry="7" />
      </g>
      <rect y="140" width="320" height="20" fill="#7CC36A" />

      {tipo === "rizo" ? (
        <g fill="none" stroke="#1B1F3B" strokeWidth="5" strokeLinecap="round">
          <path d="M0 132 L 320 132" />
          <circle cx="190" cy="92" r="40" />
          <path d="M150 140 L150 132 M230 140 L230 132 M190 132 L190 140" strokeWidth="3" />
        </g>
      ) : (
        <g fill="none" stroke="#1B1F3B" strokeWidth="5" strokeLinecap="round">
          <path d={vias[tipo]} />
        </g>
      )}

      {tipo === "colina" && <Carrito x={160} y={40} />}
      {tipo === "caida" && <Carrito x={128} y={70} angulo={48} />}
      {tipo === "rizo" && <Carrito x={152} y={104} angulo={-62} />}
      {tipo === "recta" && (
        <>
          <path d="M210 60 Q 250 20 290 60 L 290 124 L 210 124 Z" fill="#B9A6E8" />
          <path d="M228 124 L228 78 Q 250 54 272 78 L272 124 Z" fill="#1B1F3B" opacity="0.8" />
          <g stroke="#FF5A36" strokeWidth="3" strokeLinecap="round">
            <path d="M40 104 L70 104 M30 112 L64 112" />
          </g>
          <Carrito x={110} y={122} />
        </>
      )}
      {tipo === "choque" && (
        <>
          <Carrito x={110} y={126} />
          <Carrito x={200} y={126} color="#2BB673" />
          <g stroke="#FFC23C" strokeWidth="3" strokeLinecap="round">
            <path d="M150 92 L156 80 M156 98 L168 92 M146 100 L140 88" />
          </g>
        </>
      )}
    </svg>
  );
}

export default function IlustracionReto({ reto, pequena = false }) {
  const [fallo, setFallo] = useState(false);
  const imagen = reto.contenido.imagen;

  return (
    <div className={`ilustracion ${pequena ? "ilustracion-pequena" : ""}`}>
      {imagen && !fallo ? (
        <img src={imagen} alt={reto.contenido.titulo} onError={() => setFallo(true)} />
      ) : (
        <Escena tipo={escenaDelReto(reto)} />
      )}
    </div>
  );
}
