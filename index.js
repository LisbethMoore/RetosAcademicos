// lee el archivo .env (en local). En Render no hay .env: las variables se configuran en su panel
try {
  process.loadEnvFile()
} catch {
  console.log('No hay archivo .env, se usan las variables de entorno del servidor')
}

let mongoose = require('mongoose')
const app = require('./app')

mongoose.connect(process.env.MONGODB_URI)  
  .then(() => {
    console.log('Database connected successfully')

    app.listen(app.get('port'), () => {
      console.log(`Server running on port ${app.get('port')}`)
    })
  })
  .catch(err => console.error(err))