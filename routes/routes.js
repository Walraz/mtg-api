module.exports = function(app, connection, moment, io) {

  app.get('/1/mtg-games', function(req, res) {
    connection.query('SELECT * from mtg_games', function(err, rows, fields) {
    if(!err) {
      res.send(rows)
    } else {
      console.log(err)
      res.sendStatus(500)
    }
    })
  })

  app.post('/1/mtg-games', function(req, res) {
    connection.query('INSERT INTO mtg_games SET ?', req.body, function(err, rows, fields) {
    if(!err) {
      connection.query('SELECT * FROM mtg_games WHERE Id = ?', [rows.insertId], function(err, rows, fields) {
        if(!err) {
          io.emit('create match', rows[0])
          res.send(rows[0])
        } else {
          console.log(err)
          res.sendStatus(500)
        }
      })
    } else {
      console.log(err)
      res.sendStatus(500)
    }
    })
  })

  app.put('/1/mtg-games', function(req, res) {
    connection.query('UPDATE mtg_games SET Game_On = ?, Opponents = ? WHERE Id = ?', [req.body.Game_On, req.body.Opponents, req.body.Id], function(err, rows, fields) {
    if(!err) {
      io.emit('join match', req.body)
      res.send(req.body)
    } else {
      console.log(err)
      res.sendStatus(500)
    }
    })
  })

}
