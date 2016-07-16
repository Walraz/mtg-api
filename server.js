var express    = require('express')
var http       = require('http')
var routes     = require('./routes/routes')
var net      = require('net-socket')
var mysql      = require('mysql2')
var cors       = require('cors')
var bodyParser = require('body-parser')
var moment     = require('moment')

// Create a express application
var app    = express()
app.use(cors())
app.use(bodyParser.json())

// Create HTTP server and websocket
var server = http.createServer(app)
var io     = require('socket.io')(server)
var pool = mysql.createPool({
  connectionLimit: 100,
  timezone: 'utc',
  dateStrings: true,
  host: 'db4free.net',
  user: 'walraz',
  password: 'ninja1234',
  database: 'walraz_dev_db',
  stream: function(opts) {
    var s = net.connect(opts.config.port, opts.config.host);
    s.setKeepAlive(true);
    return s;
  }
})

// Bootstrap routes
routes(app, pool, moment, io)

// Set default server port
var PORT = process.env.PORT || 3002

io.on('connection', function(socket) {
  console.log('a user connected')
  console.log('Socket id: ' + socket.id)
  socket.on('disconnect', function() {
    console.log('user disconnected')
  })
  socket.on('created match', function(gameId) {
    console.log(gameId)
    console.log('Created game: ' + gameId)
    socket.join(gameId)
  })
  socket.on('joined match', function(id) {
    var gameId = 'GameId_' + id
    console.log('Joined game: ' + gameId)
    socket.join(gameId)
    io.sockets.in(gameId).emit('start match', id)
  })
})

// Start server
server.listen(PORT, function() {
  console.log(`Listening on: http://localhost:${PORT}`)
})
