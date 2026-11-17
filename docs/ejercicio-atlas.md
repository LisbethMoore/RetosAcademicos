# Ejercicio MongoDB Atlas (NoSQL5)

Ejercicio de la presentación NoSQL5: usar MongoDB Atlas (base de datos en la nube) desde el Shell y Compass (la conexión con Robo 3T se omitió por indicación del profesor). La base `retosdb` creada en este ejercicio es la que usa la API del proyecto.

| # | Paso del ejercicio | Estado |
|---|---|---|
| 1 | Crear cuenta de Atlas | ✅ Cuenta creada, cluster `Cluster0` |
| 2 | Conectarse al Shell | ✅ (mongosh) |
| 3 | Mostrar las bases de datos | ✅ `show dbs` |
| 4 | Crear base de datos, una colección y un documento desde el Shell | ✅ `retosdb` → `usuarios` → 1 documento |
| 5 | Visualizarla en Atlas | ✅ Data Explorer → `retosdb` → `usuarios` |
| 6 | Conectarse desde Compass | ✅ |
| 7 | Mostrar las bases de datos | ✅ |
| 8 | Crear base de datos, una colección y un documento desde Compass | ✅ `ejercicioCompass` → `estudiantes` → 1 documento |
| 9 | Visualizarla en Atlas | ✅ Data Explorer → `ejercicioCompass` → `estudiantes` |
| 10 | Conectarse a Atlas con Robo 3T | Omitido (indicación del profesor) |

-----------------------------------------------------------------------------------------------------------------------------------------------------------

## 1. Cuenta y cluster en Atlas

- Cluster: `Cluster0` (`cluster0.iv54xhv.mongodb.net`)
- Database User: `lismoore28_db_user` (Database Access)
- Network Access: la IP del equipo debe estar permitida (o `0.0.0.0/0` para pruebas)
- Cadena de conexión (Connect → Shell / Drivers):

```
mongodb+srv://lismoore28_db_user:<contraseña>@cluster0.iv54xhv.mongodb.net/
```

-----------------------------------------------------------------------------------------------------------------------------------------------------------

## 2. Shell (mongosh)

Conexión:

```
mongosh "mongodb+srv://cluster0.iv54xhv.mongodb.net/" --username lismoore28_db_user
```

Sesión (salida real):

```
Atlas atlas-cluster0 [primary] test> show dbs
montanarusa   372.00 KiB
sample_mflix  214748.00 KiB
admin         0.00 KiB
local         0.00 KiB

Atlas atlas-cluster0 [primary] test> use retosdb
switched to db retosdb

Atlas atlas-cluster0 [primary] retosdb> db.createCollection("usuarios")
{ ok: 1 }

Atlas atlas-cluster0 [primary] retosdb> db.usuarios.insertOne({
  nombre: "Lisbeth Moore",
  email: "lismoore@gmail.com",
  contrasena: "123456",
  rol: "jugador",
  institucion: "Universidad Autonoma del Cauca",
  nivelAcademico: "Universitario"
})
{
  acknowledged: true,
  insertedId: ObjectId('6acf08b8e4717875a268f9b4')
}

Atlas atlas-cluster0 [primary] retosdb> show collections
usuarios

Atlas atlas-cluster0 [primary] retosdb> db.usuarios.find()
[
  {
    _id: ObjectId('6acf08b8e4717875a268f9b4'),
    nombre: 'Lisbeth Moore',
    email: 'lismoore@gmail.com',
    rol: 'jugador',
    institucion: 'Universidad Autonoma del Cauca',
    nivelAcademico: 'Universitario',
    __v: 0
  }
]

Atlas atlas-cluster0 [primary] retosdb> show dbs
montanarusa   372.00 KiB
retosdb       8.00 KiB
sample_mflix  214748.00 KiB
admin         0.00 KiB
local         0.00 KiB
```

Después se cargaron los demás datos del proyecto (carpeta `datos`): `retosdb` quedó con 30 retos, 3 usuarios, 4 partidas y 10 respuestas.

**Visualizarla en Atlas:** entrar a cloud.mongodb.com → `Cluster0` → **Browse Collections** (Data Explorer) → `retosdb` → `usuarios`. Tomar captura.

-----------------------------------------------------------------------------------------------------------------------------------------------------------

## 3. MongoDB Compass

1. Abrir Compass → **Add new connection**.
2. Pegar la cadena de conexión (con la contraseña real) y dar **Save & Connect**:
   ```
   mongodb+srv://lismoore28_db_user:<contraseña>@cluster0.iv54xhv.mongodb.net/
   ```
3. En el panel izquierdo aparecen las bases de datos (`montanarusa`, `retosdb`, `sample_mflix`…). Tomar captura.
4. Al lado del nombre de la conexión dar **+** (Create database):
   - Database Name: `ejercicioCompass`
   - Collection Name: `estudiantes`
5. Entrar a `ejercicioCompass.estudiantes` → **ADD DATA** → **Insert document** y pegar:
   ```json
   { "nombre": "Ana Pérez", "nivelAcademico": "Primaria" }
   ```
6. Dar **Insert** y tomar captura del documento. Resultado:
   ```
   _id: ObjectId('6af10fec55e39f80b94d3a72')
   nombre: "Ana Pérez"
   nivelAcademico: "Primaria"
   ```
   El documento tiene la misma forma del registro rápido de jugador del proyecto (nombre y nivel académico).
7. **Visualizarla en Atlas:** Browse Collections → `ejercicioCompass` → `estudiantes`. Tomar captura.
