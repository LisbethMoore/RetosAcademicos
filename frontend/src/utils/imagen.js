// Convierte la imagen que escoge el administrador en un texto (data URL) liviano
// para guardarlo dentro del reto en MongoDB. Antes de convertirla la achica a máximo
// 800 px y la comprime, así cada imagen pesa poco (unos 30-80 KB).

const LADO_MAXIMO = 800;
const PESO_MAXIMO = 400 * 1024; // lo que acepta la API

function leerComoImagen(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}

export async function comprimirImagen(archivo) {
  if (!archivo.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG o WebP)");
  }
  if (archivo.size > 10 * 1024 * 1024) {
    throw new Error("La imagen pesa más de 10 MB, escoge una más liviana");
  }

  const img = await leerComoImagen(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  // WebP conserva la transparencia; si queda muy pesada se baja la calidad
  for (const calidad of [0.82, 0.7, 0.55, 0.4]) {
    const dataUrl = canvas.toDataURL("image/webp", calidad);
    if (dataUrl.length <= PESO_MAXIMO) return dataUrl;
  }
  throw new Error("La imagen sigue siendo muy pesada, escoge una más sencilla");
}
