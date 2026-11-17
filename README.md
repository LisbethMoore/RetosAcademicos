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
- MongoDB Atlas (base de datos en la nube)
- Mongoose
- Nodemon
- Thunder Client
- bcryptjs, jsonwebtoken (JWT) y cookie-parser (login y sesiones)
- ReactJS + Vite, Axios y React Router (frontend)

-----------------------------------------------------------------------------------------------------------------------------------------------------------

COMO EJECUTAR EL PROYECTO

1. Tener instalado Node.js. La base de datos está en **MongoDB Atlas** (cluster `Cluster0`, base `retosdb`), así que no hace falta tener MongoDB instalado; solo se necesita internet y que la IP del equipo esté permitida en Atlas (Network Access). Si se prefiere trabajar sin internet, se puede usar MongoDB local.

2. Descargar el proyecto e instalar las dependencias:

```
npm install
```

3. Crear un archivo `.env` en la raíz del proyecto, copiando el contenido de `.env.ejemplo`:

```
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.iv54xhv.mongodb.net/retosdb?appName=Cluster0
PORT=3000
TOKEN_SECRET=<clave larga y aleatoria>
FRONTEND_URL=http://localhost:5173
```

`<usuario>` y `<contraseña>` son los del Database User creado en Atlas (Database Access). Para usar MongoDB local en su lugar: `MONGODB_URI=mongodb://127.0.0.1:27017/retosdb`. `TOKEN_SECRET` es la clave con la que se firman los tokens de sesión y `FRONTEND_URL` es el único origen que CORS deja consumir la API.

4. Iniciar el servidor (con `npm run dev` se reinicia solo con nodemon al cambiar el código; `npm start` es el que usa Render):

```
npm run dev
```

Si todo está bien, en la terminal sale:

```
Database connected successfully
Server running on port 3000
```

5. La base `retosdb` en Atlas ya tiene cargados los datos de la carpeta `datos` (30 retos, 3 usuarios, 4 partidas y 10 respuestas). Para cargarlos en otra base, en MongoDB Compass se conecta a la base y en cada colección (usuarios, retos, partidas y respuestas) se importa su archivo, por ejemplo `retosdb.usuarios.json` en la colección usuarios. El paso a paso de cómo se creó la base en Atlas está en `docs/ejercicio-atlas.md`.

6. Iniciar el frontend (con la API corriendo), en otra terminal:

```
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173. Usuarios de prueba (están en `datos/retosdb.usuarios.json`, con la contraseña cifrada):

| Usuario | Contraseña | Rol |
|---|---|---|
| `lisbeth` | `123456` | jugador (Universitario) |
| `carlos` | `123456` | jugador (Universitario) |
| `admin` | `admin123` | administrador |

Si la API no está en `http://localhost:3000/api`, se crea `frontend/.env` copiando `frontend/.env.ejemplo` y se cambia `VITE_API_URL`.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

DESPLIEGUE EN RENDER

Se despliega como **un solo Web Service** (archivo `render.yaml`): Render construye el frontend de React y la API de Express lo entrega en la misma dirección (la API en `/api`). Así todo queda en el mismo dominio y la cookie de la sesión funciona en cualquier navegador, también en incógnito (los navegadores bloquean las cookies entre dominios distintos). En el código el frontend y el backend siguen siendo aplicaciones separadas; en local corren aparte como siempre.

1. En Atlas → **Network Access** → permitir `0.0.0.0/0` (Render no tiene una IP fija en el plan gratis).
2. En https://render.com → **New → Blueprint** → escoger el repositorio. Render lee `render.yaml`.
3. Escribir el valor de `MONGODB_URI` (la cadena de conexión de Atlas). `TOKEN_SECRET` lo genera Render, y `NODE_ENV=production` y `VITE_API_URL=/api` ya vienen en el archivo.
4. Esperar a que termine el despliegue y abrir la URL que da Render (`https://<nombre>.onrender.com`).

Detalles de producción que ya están en el código:

- `index.js` no falla si no hay `.env` (en Render las variables están en su panel).
- `npm start` usa `node` (nodemon queda solo para desarrollo con `npm run dev`).
- `app.js` entrega la carpeta `frontend/dist` si existe, y cualquier ruta que no sea `/api` la resuelve React Router.
- `app.set('trust proxy', 1)`: Render pone la API detrás de un proxy HTTPS; en producción la cookie es `Secure`.
- En el plan gratis el servicio se "duerme" tras 15 minutos sin uso; la primera petición tarda unos 50 segundos en despertarlo.

FECHAS

- La partida guarda `fechaInicio` y `fechaFin`, y cada respuesta guarda `fecha`.
- **Todas las fechas las pone el backend** (`new Date()` en el servidor), nunca el navegador. MongoDB las guarda en UTC.
- Al responder la última pregunta se usa **la misma fecha** para la respuesta y para el `fechaFin` de la partida, así coinciden exactamente.
- El frontend solo las muestra en la hora de Colombia (`America/Bogota`). Así, aunque el frontend y la API estén en servidores distintos (Render usa UTC), las fechas siempre coinciden.

DISEÑO E IMÁGENES

- Fondo de paisaje (`frontend/public/fondo.webp`) y la **mascota de la Uniautónoma** en el carrito (`frontend/public/mascota.webp`): aparece en la portada y celebrando al terminar la partida.
- Cada reto puede tener una **imagen**: el administrador la selecciona desde su computador (JPG, PNG o WebP). El navegador la achica a máximo 800 px y la comprime (unos 30-80 KB) y se guarda **dentro del reto en MongoDB** (campo `contenido.imagen`, como data URL). No se guarda como archivo en el servidor porque en Render los archivos subidos se borran al reiniciar.
- Si el reto no tiene imagen, el juego dibuja una escena de la montaña rusa según el tema de la pregunta (colina, caída, rizo, túnel o choque).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

ESTRUCTURA DEL PROYECTO

```
RetosAcademicos/
├── controllers/     lógica de cada funcionalidad (auth.js: registro, login, logout y perfil)
├── middlewares/     auth.js: verifica la sesión (token) y el rol
├── libs/            jwt.js: crea el token de la sesión
├── models/          esquemas de las colecciones
├── routes/          rutas de la API
├── datos/           datos de prueba para importar en MongoDB
├── frontend/        React + Vite: login, registro, jugar y CRUD de retos
│   └── src/
│       ├── api/         Axios hacia la API (axios.js con withCredentials, auth.js, retos.js y partidas.js)
│       ├── context/     AuthContext.jsx: usuario con la sesión iniciada
│       ├── components/  Header, RetoCard, RetoForm, RutaProtegida e IlustracionReto
│       ├── utils/       fechas.js (hora de Colombia) e imagen.js (comprime la imagen del reto)
│       ├── pages/       Home, Login, Registro, Jugar, Retos, CrearReto y EditarReto
│       ├── styles/      global.css y forms.css
│       ├── App.jsx      rutas con React Router
│       └── main.jsx
├── app.js           configuración de Express y rutas
├── index.js         conexión a MongoDB y arranque del servidor
├── render.yaml      despliegue en Render (API + frontend)
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

| # | Funcionalidad | Ruta | Quién |
|---|---|---|---|
| 1 | Registro rápido de jugador (nombre, usuario, contraseña y nivel) | `POST /api/auth/registro` | cualquiera |
| 2 | Registrar reto | `POST /api/retos` | administrador |
| 3 | Buscar retos activos por nivel | `GET /api/retos?nivel=Básico` | con sesión |
| 4 | Activar o desactivar un reto | `PATCH /api/retos/:id/estado` | administrador |
| 5 | Iniciar partida (retos al azar de su nivel) | `POST /api/partidas` | jugador |
| 6 | Responder un reto | `POST /api/respuestas` | jugador |
| 7 | Mi historial de partidas | `GET /api/partidas` (admin: `GET /api/partidas/usuario/:usuarioId`) | con sesión |
| 8 | Mi historial de respuestas | `GET /api/respuestas?correcta=false` (admin: `GET /api/respuestas/usuario/:usuarioId`) | con sesión |
| 9 | Ranking de jugadores | `GET /api/estadisticas/jugadores?limite=3` | administrador |
| 10 | Retos más difíciles | `GET /api/estadisticas/retos-dificiles?limite=1` | administrador |
| 11 | CRUD de retos desde el frontend (ver abajo) | | administrador |
| 12 | Login, sesión y cerrar sesión (ver abajo) | `/api/auth/...` | |

LOGIN, SESIONES Y CORS

| Operación | Ruta |
|---|---|
| Registrarse (queda con la sesión iniciada) | `POST /api/auth/registro` |
| Iniciar sesión | `POST /api/auth/login` con `{ "usuario": "lisbeth", "contrasena": "123456" }` |
| Cerrar sesión | `POST /api/auth/logout` |
| Usuario de la sesión | `GET /api/auth/perfil` |

- **Sin datos quemados:** no hay usuarios ni contraseñas escritos en el código. Al iniciar sesión se busca el usuario en MongoDB y la contraseña se compara con `bcrypt`; en la base las contraseñas se guardan cifradas (hash), nunca en texto plano.
- **Sesión con token:** al iniciar sesión la API crea un token JWT (con el id y el rol, firmado con `TOKEN_SECRET`) y lo guarda en una cookie `httpOnly`, que el JavaScript del navegador no puede leer. El navegador la envía sola en cada petición (`withCredentials` en Axios) y el middleware `authRequired` la verifica y deja en `req.user` quién es el usuario. Por eso al iniciar partida o responder **no se envía el `usuarioId`**: la API lo saca de la sesión, y un jugador no puede responder la partida de otro.
- **Roles:** el middleware `soloRol` deja el CRUD de retos y las estadísticas solo al administrador, y jugar solo al jugador. Sin sesión la API responde 401 y con el rol equivocado 403.
- **Varios usuarios a la vez:** cada navegador tiene sus propias cookies. En una ventana normal y en una de incógnito (o en dos navegadores) se puede tener un usuario distinto en cada una al mismo tiempo; en dos pestañas normales del mismo navegador se comparte la sesión porque comparten las cookies.
- **CORS:** la API solo acepta peticiones del frontend registrado en `FRONTEND_URL` (`http://localhost:5173`), no de cualquier aplicación, y con `credentials: true` para que viaje la cookie.

CRUD DE RETOS (FRONTEND)

El frontend en React consume estas rutas de la API para que el administrador gestione el banco de retos:

| Operación | Ruta |
|---|---|
| Listar (también inactivos, con filtro por nivel) | `GET /api/retos?todos=true&nivel=Básico` |
| Consultar uno completo | `GET /api/retos/:id` |
| Crear | `POST /api/retos` |
| Editar | `PUT /api/retos/:id` |
| Eliminar | `DELETE /api/retos/:id` |
| Activar / desactivar | `PATCH /api/retos/:id/estado` |

Un reto solo se puede eliminar si nadie lo ha respondido; si ya tiene respuestas la API responde 400 y hay que desactivarlo, así no se daña el historial ni las estadísticas.

RETOS ALEATORIOS

Para que el jugador no se aprenda las respuestas, al iniciar una partida los retos se escogen al azar con `$sample` de un banco de retos activos del nivel del jugador (Primaria → Básico, Secundaria → Intermedio, Universitario → Avanzado), y el orden de las opciones se mezcla. Los retos que salieron se guardan en la partida (`retosAsignados`) y solo esos se pueden responder. La carpeta `datos` trae un banco de 30 retos, 10 por nivel.

Ejemplo:

```
POST /api/partidas      (con la sesión del jugador iniciada)
{ "totalPreguntas": 5 }
```

Al responder un reto, la partida se actualiza con `$inc` (puntos, aciertos, errores y tiempo) y el porcentaje de aciertos lo calcula MongoDB, así no se escriben los valores a mano.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

RESPUESTA DE LA API

Todas las respuestas son en JSON y usan estos códigos:

- 200: consulta o actualización correcta
- 201: registro creado
- 400: datos incompletos o no válidos
- 401: no hay sesión iniciada o el token no es válido
- 403: el usuario no tiene el rol para esa acción
- 404: el recurso no existe o la ruta no existe
- 500: error interno del servidor
