# Historias de usuario - Sistema de Retos Académicos

Proyecto del Parcial 2 de Bases de Datos Avanzadas: una API en Node.js y MongoDB para un videojuego educativo de montaña rusa con preguntas de física. Los niveles son Básico (primaria), Intermedio (secundaria) y Avanzado (universidad).

**Integrante:** Lisbeth Moore  
**Fechas:** del 30/09/2026 al 14/10/2026

Cada historia corresponde a una de las 10 funcionalidades que se muestran en la sustentación. El peso es qué tan pesada fue la historia, de 1 (fácil) a 5 (difícil).

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H001 - Registrar usuario

Como administrador quiero registrar usuarios en el sistema para que puedan entrar a jugar los retos.

- Rol: Administrador
- Sprint: 1  |  Peso: 2
- Responsable: Lisbeth Moore
- Ruta: `POST /api/usuarios`

Criterios de aceptación:

- Se registra con nombre, correo, contraseña, rol, institución y nivel académico.
- Si falta algún dato no se guarda y sale un mensaje de error.
- El rol solo puede ser jugador o administrador.
- No se pueden repetir correos: si el correo ya existe sale el mensaje "El email ya está registrado".
- Si todo está bien, el usuario queda guardado en MongoDB.

Resultado esperado: Se guarda el usuario (201). Si falta un dato, el rol no es válido o el correo ya existe, sale error (400).

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
- Ruta: `POST /api/partidas`

Criterios de aceptación:

- Se indica el jugador y el número de preguntas.
- Solo los jugadores pueden empezar partidas, el administrador no.
- No se pueden pedir más preguntas de las que hay activas.
- La partida empieza con puntos, aciertos, errores, tiempo y porcentaje en 0.
- Si el usuario no existe sale error 404.

Resultado esperado: Se crea la partida con todo en 0 (201). Si es administrador o pide demasiadas preguntas (400), o el usuario no existe (404), sale error.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

H006 - Responder reto

Como jugador quiero responder un reto y saber enseguida si acerté para ir sumando puntos y ver cómo voy en la partida.

- Rol: Jugador
- Sprint: 2  |  Peso: 5
- Responsable: Lisbeth Moore
- Ruta: `POST /api/respuestas`

Criterios de aceptación:

- Se envía la partida, el reto, la respuesta y cuánto tiempo me demoré.
- La API revisa sola si la respuesta es correcta: si acierto sumo 10 puntos y si fallo 0.
- No se puede responder dos veces el mismo reto en una partida ni seguir respondiendo cuando la partida ya terminó.
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
- Ruta: `GET /api/partidas/usuario/:usuarioId`

Criterios de aceptación:

- Se buscan las partidas con el id del jugador.
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
- Ruta: `GET /api/respuestas/usuario/:usuarioId?correcta=false`

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
