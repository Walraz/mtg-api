let express    = require('express')
let http       = require('http')
let routes     = require('./routes/routes')
let mysql      = require('mysql')
let cors       = require('cors')
let bodyParser = require('body-parser')
let moment     = require('moment')

// Create a express application
let app    = express()
app.use(cors())
app.use(bodyParser.json())

// Create HTTP server and websocket
let server = http.createServer(app)
let io     = require('socket.io')(server)

const connection = mysql.createConnection({
  host: 'db4free.net',
  user: 'walraz',
  password: 'ninja1234',
  database: 'walraz_dev_db'
})

// MySQL connection
connection.connect(function(err){
  if(err) throw err
  console.log("Database is connected ... \n\n")
})

// Bootstrap routes
routes(app, connection, moment, io)

// Set default server port
const PORT = process.env.PORT || 3002

io.on('connection', socket => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on('created match', (gameId) => {
    console.log(gameId)
    console.log('Created game: ' + gameId)
    socket.join(gameId)
  })
  socket.on('joined match', (id) => {
    let gameId = 'GameId_' + id
    console.log('Joined game: ' + gameId)
    socket.join(gameId)
    io.sockets.in(gameId).emit('start match', id)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${PORT}`)
})
