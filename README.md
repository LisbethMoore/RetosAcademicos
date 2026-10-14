# Sistema de Retos Académicos - API

API hecha en Node.js con Express y MongoDB para el backend de un videojuego educativo de montaña rusa.

Proyecto del Parcial 2 de Bases de Datos Avanzadas.

Integrante: Lisbeth Camila Moore Salinas

-----------------------------------------------------------------------------------------------------------------------------------------------------------

SOBRE EL PROYECTO

El videojuego consiste en una montaña rusa en la que, mientras el carrito avanza por el recorrido, van apareciendo preguntas de física (movimiento, velocidad, energía, etc.). El jugador responde y sigue avanzando: si acierta continúa normal y si se equivoca le aparece la retroalimentación con la explicación antes de seguir.

La idea es usarlo en colegios y universidades, por eso los retos tienen tres niveles:

- Básico (fácil): primaria
- Intermedio (medio): secundaria
- Avanzado (alto): universidad

Con los resultados que se guardan de cada partida y cada respuesta se busca analizar si esta forma de aprender, jugando, ayuda a los estudiantes a entender mejor los temas.

Esta API es la parte que guarda y maneja la información del juego: usuarios, retos, partidas, respuestas y estadisticas.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

TECNOLOGIAS

- Node.js
- Express
- MongoDB
- Mongoose
- Nodemon
- Thunder Client

-----------------------------------------------------------------------------------------------------------------------------------------------------------

COMO EJECUTAR EL PROYECTO

1. Tener instalado Node.js y MongoDB (o MongoDB Compass con el servidor local corriendo).

2. Descargar el proyecto e instalar las dependencias:

```
npm install
```

3. Crear un archivo `.env` en la raíz del proyecto, copiando el contenido de `.env.ejemplo`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/retosdb
PORT=3000
```

4. Iniciar el servidor:

```
npm start
```

Si todo está bien, en la terminal sale:

```
Database connected successfully
Server running at http://localhost:3000
```

5. (Opcional) Para tener datos de prueba, en MongoDB Compass se crea la base `retosdb` y en cada colección (usuarios, retos, partidas y respuestas) se importa su archivo de la carpeta `datos`, por ejemplo `retosdb.usuarios.json` en la colección usuarios.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

ESTRUCTURA DEL PROYECTO

```
RetosAcademicos/
├── controllers/     lógica de cada funcionalidad
├── models/          esquemas de las colecciones
├── routes/          rutas de la API
├── app.js           configuración de Express y rutas
├── index.js         conexión a MongoDB y arranque del servidor
├── .env.ejemplo     variables de entorno que necesita el proyecto
└── historiaUsuario.md
```

-----------------------------------------------------------------------------------------------------------------------------------------------------------

COLECCIONES EN MONGODB

- usuarios: jugadores y administradores.
- retos: preguntas de física con su nivel, opciones, respuesta correcta y retroalimentación.
- partidas: cada partida de un jugador con sus puntos, aciertos, errores, tiempo y porcentaje.
- respuestas: cada respuesta que da un jugador a un reto dentro de una partida.

Las estadisticas no se guardan en una colección aparte, se calculan con aggregate cada vez que se consultan. Con ellas se puede ver cómo les va a los jugadores y qué temas les cuestan más, que es lo que se quiere analizar con el proyecto.

-----------------------------------------------------------------------------------------------------------------------------------------------------------
FUNCIONALIDADES

Cada funcionalidad tiene su historia de usuario en historiaUsuario.md

1. Registrar usuario: `POST /api/usuarios`
2. Registrar reto: `POST /api/retos`
3. Buscar retos activos por nivel: `GET /api/retos?nivel=Básico`
4. Activar o desactivar un reto: `PATCH /api/retos/:id/estado`
5. Iniciar partida: `POST /api/partidas`
6. Responder un reto: `POST /api/respuestas`
7. Historial de partidas de un jugador: `GET /api/partidas/usuario/:usuarioId`
8. Historial de respuestas de un jugador: `GET /api/respuestas/usuario/:usuarioId?correcta=false`
9. Ranking de jugadores: `GET /api/estadisticas/jugadores?limite=3`
10. Retos más difíciles: `GET /api/estadisticas/retos-dificiles?limite=1`

Al responder un reto, la partida se actualiza con `$inc` (puntos, aciertos, errores y tiempo) y el porcentaje de aciertos lo calcula MongoDB, así no se escriben los valores a mano.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

RESPUESTA DE LA API

Todas las respuestas son en JSON y usan estos códigos:

- 200: consulta o actualización correcta
- 201: registro creado
- 400: datos incompletos o no válidos
- 404: el recurso no existe o la ruta no existe
- 500: error interno del servidor
