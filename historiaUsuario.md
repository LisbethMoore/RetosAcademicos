# Historias de usuario - Sistema de Retos Académicos

Proyecto del Parcial 2 de Bases de Datos Avanzadas: una API en Node.js y MongoDB para un videojuego educativo de montaña rusa con preguntas de física. Los niveles son Básico (primaria), Intermedio (secundaria) y Avanzado (universidad).

**Integrante:** Lisbeth Moore  
**Fechas:** del 30/09/2026 al 14/10/2026

Cada historia corresponde a una de las 10 funcionalidades que se muestran en la sustentación. El peso es qué tan pesada fue la historia, de 1 (fácil) a 5 (difícil).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H001 - Registrar usuario

Como estudiante quiero registrarme rápido, con mi nombre, un usuario, una contraseña y mi nivel académico, para empezar a jugar los retos de mi nivel.

- Rol: Jugador
- Sprint: 1  |  Peso: 2
- Responsable: Lisbeth Moore
- Ruta: `POST /api/auth/registro` (en el frontend: página `/registro`)

Criterios de aceptación:

- Registro rápido: se piden el nombre, el usuario (sin espacios), la contraseña (mínimo 4 caracteres) y el nivel académico (Primaria, Secundaria o Universitario). No se pide correo.
- Desde el registro solo se crean jugadores.
- El nivel académico define qué retos le salen: Primaria → Básico, Secundaria → Intermedio, Universitario → Avanzado.
- No se pueden repetir usuarios: si ya existe sale el mensaje "Ese usuario ya existe, escoge otro".
- La contraseña se guarda cifrada con bcrypt, nunca en texto plano, y no se devuelve en la respuesta.
- Al registrarse queda con la sesión iniciada.

Resultado esperado: Se guarda el usuario y queda con sesión (201). Si falta un dato, el nivel no es válido o el usuario ya existe, sale error (400).

Observaciones: en el tercer corte se simplificó el registro para que sea rápido para los estudiantes y se agregó el login (H012).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H002 - Registrar reto

Como administrador quiero crear retos con su pregunta, nivel, opciones y mensajes de retroalimentación para que los jugadores tengan preguntas para responder.

- Rol: Administrador
- Sprint: 1  |  Peso: 3
- Responsable: Lisbeth Moore
- Ruta: `POST /api/retos`

Criterios de aceptación:

- El reto lleva título, enunciado, tipo de pregunta, nivel, opciones, la posición de la respuesta correcta y los mensajes de acierto y de error.
- El nivel solo puede ser Básico, Intermedio o Avanzado.
- Debe tener por lo menos 2 opciones y la posición de la respuesta correcta tiene que existir.
- La respuesta correcta no se escribe a mano: la API la toma de las opciones.
- Todo reto nuevo queda activo.

Resultado esperado: Se guarda el reto activo y con su respuesta correcta (201). Si el nivel o las opciones están mal, sale error (400).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H003 - Buscar retos por nivel

Como jugador quiero ver los retos disponibles de un nivel para practicar con preguntas acordes a lo que sé.

- Rol: Jugador
- Sprint: 1  |  Peso: 2
- Responsable: Lisbeth Moore
- Ruta: `GET /api/retos?nivel=Básico`

Criterios de aceptación:

- Solo se muestran los retos activos.
- Se puede filtrar por nivel (Básico, Intermedio o Avanzado); si el nivel no existe sale un error.
- No se muestra la respuesta correcta para que el jugador no haga trampa.
- Si no hay retos de ese nivel, sale la lista vacía.

Resultado esperado: Lista de retos activos de ese nivel sin la respuesta correcta (200). Si el nivel no existe, sale error (400).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H004 - Activar o desactivar reto

Como administrador quiero activar o desactivar un reto para decidir qué preguntas aparecen en el juego sin tener que borrarlas.

- Rol: Administrador
- Sprint: 1  |  Peso: 2
- Responsable: Lisbeth Moore
- Ruta: `PATCH /api/retos/:id/estado`

Criterios de aceptación:

- Solo se cambia si el reto está activo o no; lo demás del reto no se toca.
- Un reto desactivado ya no les aparece a los jugadores ni se puede responder.
- Si el reto no existe sale error 404; si el dato no es true o false sale error 400.
- El reto no se borra, así no se pierden las respuestas que ya tiene.

Resultado esperado: El reto queda activado o desactivado (200). Si el reto no existe (404) o el dato está mal (400), sale error.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H005 - Iniciar partida

Como jugador quiero empezar una partida y elegir cuántas preguntas voy a responder para poder jugar y que se guarde mi resultado.

- Rol: Jugador
- Sprint: 1  |  Peso: 3
- Responsable: Lisbeth Moore
- Ruta: `POST /api/partidas` (requiere sesión de jugador)

Criterios de aceptación:

- Se indica el número de preguntas (si no se envía, son 6). El jugador no se envía: la API lo toma de la sesión.
- Solo los jugadores pueden empezar partidas, el administrador no.
- Los retos se escogen al azar (con `$sample`) de un banco de retos activos del nivel del jugador: Primaria → Básico, Secundaria → Intermedio, Universitario → Avanzado. Así no salen siempre las mismas preguntas y el jugador no se aprende las respuestas.
- El orden de las opciones de cada reto también se mezcla en cada partida.
- Los retos que salieron quedan guardados en la partida (`retosAsignados`) y se devuelven sin la respuesta correcta ni la retroalimentación.
- No se pueden pedir más preguntas de las que hay activas en ese nivel.
- La partida empieza con puntos, aciertos, errores, tiempo y porcentaje en 0.
- Se guarda la fecha de inicio (`fechaInicio`), puesta por el servidor.
- Si el usuario no existe sale error 404.

Resultado esperado: Se crea la partida con todo en 0 y la lista de retos que le salieron (201). Si es administrador, su nivel académico no es válido o pide demasiadas preguntas (400), o el usuario no existe (404), sale error.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H006 - Responder reto

Como jugador quiero responder un reto y saber enseguida si acerté para ir sumando puntos y ver cómo voy en la partida.

- Rol: Jugador
- Sprint: 2  |  Peso: 5
- Responsable: Lisbeth Moore
- Ruta: `POST /api/respuestas` (requiere sesión de jugador)

Criterios de aceptación:

- Se envía la partida, el reto, la respuesta y cuánto tiempo me demoré.
- Solo puedo responder mis propias partidas (si no, error 403).
- Cada respuesta guarda su fecha (`fecha`), puesta por el servidor. Al responder la última pregunta, la partida guarda `fechaFin` con exactamente la misma fecha.
- La API revisa sola si la respuesta es correcta: si acierto sumo 10 puntos y si fallo 0.
- No se puede responder dos veces el mismo reto en una partida ni seguir respondiendo cuando la partida ya terminó.
- Solo se pueden responder los retos que le salieron al jugador en esa partida.
- La respuesta tiene que ser una de las opciones del reto.
- Los puntos, aciertos, errores y tiempo se suman con $inc y el porcentaje lo calcula MongoDB, así no se ponen los valores a mano.

Resultado esperado: Dice si acerté, muestra el mensaje de retroalimentación y la partida actualizada (201). Si se rompe una regla del juego sale error (400 o 404).

Observaciones: aquí se aplicó la corrección del Parcial 1: usar `$inc` en vez de `$set` con valores a mano.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H007 - Historial de partidas

Como jugador quiero ver mis partidas anteriores para saber cómo me ha ido y si he mejorado.

- Rol: Jugador
- Sprint: 2  |  Peso: 2
- Responsable: Lisbeth Moore
- Ruta: `GET /api/partidas` (mis partidas, según la sesión); el administrador puede ver las de cualquier jugador con `GET /api/partidas/usuario/:usuarioId`

Criterios de aceptación:

- Se buscan las partidas del jugador que tiene la sesión iniciada; en el frontend se ven en la página Jugar.
- Salen de la más nueva a la más vieja.
- De cada partida se ven los puntos, el tiempo, los aciertos, los errores y el porcentaje.
- Si el jugador no existe sale error 404; si no ha jugado sale la lista vacía.

Resultado esperado: Lista de partidas del jugador (200). Si el jugador no existe, sale error (404).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H008 - Historial de respuestas

Como jugador quiero ver mis respuestas con la pregunta y la respuesta correcta para saber en qué me equivoqué y qué debo repasar.

- Rol: Jugador
- Sprint: 2  |  Peso: 3
- Responsable: Lisbeth Moore
- Ruta: `GET /api/respuestas?correcta=false` (mis respuestas, según la sesión); el administrador usa `GET /api/respuestas/usuario/:usuarioId`

Criterios de aceptación:

- Cada respuesta muestra el título del reto, el nivel y cuál era la respuesta correcta (se une con $lookup).
- Se pueden ver solo los errores o solo los aciertos.
- Salen de la más nueva a la más vieja.
- Si el jugador no existe sale error 404.

Resultado esperado: Lista de respuestas con el nombre del reto y la respuesta correcta (200). Si el jugador no existe, sale error (404).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H009 - Ranking de jugadores

Como administrador quiero ver un ranking con el desempeño de cada jugador para saber quién va mejor y cómo les está yendo.

- Rol: Administrador
- Sprint: 2  |  Peso: 3
- Responsable: Lisbeth Moore
- Ruta: `GET /api/estadisticas/jugadores?limite=3`

Criterios de aceptación:

- Por cada jugador se ve cuántas partidas jugó, sus puntos totales, su promedio, su mejor puntaje, aciertos, errores, porcentaje y tiempo promedio.
- No se cuentan las partidas que no tienen respuestas.
- Sale ordenado de mayor a menor puntaje y se puede pedir solo el top (por ejemplo los 3 primeros).
- Se calcula con aggregate cada vez que se consulta, no se guarda aparte.

Resultado esperado: Ranking de jugadores con sus estadísticas (200). Si el límite no es un número válido, sale error (400).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H010 - Retos más difíciles

Como administrador quiero saber cuáles retos fallan más los jugadores para reforzar esos temas.

- Rol: Administrador
- Sprint: 2  |  Peso: 3
- Responsable: Lisbeth Moore
- Ruta: `GET /api/estadisticas/retos-dificiles?limite=1`

Criterios de aceptación:

- Por cada reto se ve cuántas veces lo respondieron, cuántas lo fallaron y el porcentaje de error.
- Se muestra el título y el nivel del reto.
- Sale ordenado del más difícil al más fácil y se puede pedir solo los primeros.

Resultado esperado: Lista de retos del más fallado al menos fallado (200). Si el límite no es un número válido, sale error (400).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H011 - CRUD de retos desde el frontend

Como administrador quiero una página web para ver, crear, editar, activar/desactivar y eliminar retos sin tener que usar Thunder Client.

- Rol: Administrador
- Sprint: 3  |  Peso: 4
- Responsable: Lisbeth Moore
- Rutas: `GET /api/retos?todos=true`, `GET /api/retos/:id`, `POST /api/retos`, `PUT /api/retos/:id`, `DELETE /api/retos/:id`

Criterios de aceptación:

- El frontend está hecho con React + Vite y consume la API con Axios; la navegación es con React Router.
- La lista muestra todos los retos (activos e inactivos), se puede buscar por texto y filtrar por nivel.
- El mismo formulario sirve para crear y editar: título, enunciado, nivel, tipo de pregunta, opciones (mínimo 2, se marca la correcta) y mensajes de retroalimentación.
- Al editar se cambian todos los datos del reto y se conserva si estaba activo o no.
- Un reto solo se puede eliminar si nadie lo ha respondido; si ya tiene respuestas sale un error y se sugiere desactivarlo.
- Los errores de la API se muestran en la página.
- La API tiene CORS habilitado para que el navegador permita las peticiones del frontend.

Resultado esperado: El administrador gestiona el banco de retos desde el navegador (200/201). Si los datos están mal o el reto ya tiene respuestas (400), o el reto no existe (404), se muestra el mensaje de error.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H012 - Login, sesiones y CORS

Como usuario quiero iniciar sesión con mi usuario y contraseña para que el juego sepa quién soy sin tener que enviar mis datos en cada petición, y que solo el frontend del juego pueda usar la API.

- Rol: Jugador / Administrador
- Sprint: 3  |  Peso: 5
- Responsable: Lisbeth Moore
- Rutas: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/perfil` (en el frontend: páginas `/login` y `/jugar`)

Criterios de aceptación:

- Sin datos quemados: los usuarios están en MongoDB, la contraseña se compara con bcrypt y la clave del token está en el `.env`.
- Al iniciar sesión la API crea un token JWT y lo guarda en una cookie httpOnly; el navegador la envía en cada petición.
- Las rutas protegidas leen el usuario del token (`req.user`): sin sesión responden 401 y con el rol equivocado 403.
- El administrador maneja los retos y las estadísticas; el jugador inicia partidas y responde.
- Se pueden tener dos usuarios con sesión al mismo tiempo en navegadores distintos o en una ventana normal y una de incógnito, porque cada una tiene sus propias cookies.
- CORS solo acepta peticiones del frontend registrado (`FRONTEND_URL`), con credenciales para que viaje la cookie.
- Al recargar la página la sesión se mantiene; al cerrar sesión se borra la cookie.

Resultado esperado: El usuario inicia sesión (200) y usa la aplicación según su rol. Si el usuario o la contraseña están mal sale error (400) con el mismo mensaje para ambos casos.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H013 - Fechas de las partidas y respuestas

Como administrador quiero saber cuándo se jugó cada partida y cuándo se respondió cada pregunta, con fechas que coincidan, para analizar el uso del juego.

- Rol: Administrador / Jugador
- Sprint: 4  |  Peso: 2
- Responsable: Lisbeth Moore

Criterios de aceptación:

- La partida guarda `fechaInicio` y `fechaFin`; cada respuesta guarda `fecha`.
- Las fechas las genera siempre el backend, nunca el navegador, y se guardan en UTC.
- La fecha de fin de la partida es exactamente la misma de su última respuesta.
- El frontend muestra las fechas en la hora de Colombia, aunque el frontend y la API estén en servidores distintos.
- En la página Jugar el historial muestra la fecha de cada partida y si quedó terminada.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H014 - Diseño del juego e imágenes

Como jugador quiero un juego más visual, con las preguntas ilustradas y la mascota de la universidad, para que sea más entretenido.

- Rol: Jugador / Administrador
- Sprint: 4  |  Peso: 3
- Responsable: Lisbeth Moore

Criterios de aceptación:

- Cada reto puede tener una imagen que el administrador selecciona desde su computador; se comprime en el navegador y se guarda dentro del reto en MongoDB. Si no tiene, se muestra una ilustración según el tema de la pregunta.
- El administrador ve la vista previa y puede cambiar o quitar la imagen al crear o editar un reto.
- La página tiene un fondo de paisaje y la mascota de la Uniautónoma en la portada.
- Al terminar aparece la mascota celebrando, con los puntos, estrellas según el porcentaje y la fecha en que terminó.
- La página se ve bien en computador y en celular.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H015 - Despliegue en Render

Como equipo queremos publicar la aplicación en internet para que se pueda usar sin instalar nada.

- Rol: Equipo
- Sprint: 4  |  Peso: 3
- Responsable: Lisbeth Moore

Criterios de aceptación:

- La API se despliega en Render como Web Service y el frontend como Static Site (`render.yaml`).
- Las claves (conexión a Atlas, clave del token) se configuran en Render, no en el código.
- CORS acepta solo la URL del frontend en Render y la cookie de sesión funciona entre los dos dominios (`SameSite=None; Secure`).

