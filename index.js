process.loadEnvFile()  // 👈 lee el archivo .env

let mongoose = require('mongoose')
const app = require('./app')

mongoose.connect(process.env.MONGODB_URI)  
  .then(() => {
    console.log('Database connected successfully')

    app.listen(app.get('port'), () => {
      console.log(`Server running at http://localhost:${app.get('port')}`)
    })
  })
  .catch(err => console.error(err))