module.exports = function(app, pool, moment, io) {

  app.get('/1/mtg-games', function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query('SELECT * from mtg_games', function(err, rows, fields) {
        connection.release()
        if(!err) {
          var data = rows
          data.forEach(function(row) {
            row.Time_Created = moment(row.Time_Created).format('YYYY-MM-DD HH:mm:ss+00:00')
          })
          res.send(data)
        } else {
          console.log(err)
          res.sendStatus(500)
        }
        })
    })
  })

  app.post('/1/mtg-games', function(req, res) {
    pool.getConnection(function(err, connection) {
      req.body.Time_Created = moment.utc().format('YYYY-MM-DD HH:mm:ss')
      connection.query('INSERT INTO mtg_games SET ?', req.body, function(err, rows, fields) {
      if(!err) {
        connection.query('SELECT * FROM mtg_games WHERE Id = ?', [rows.insertId], function(err, rows, fields) {
          connection.release()
          if(!err) {
            var data = rows[0]
            data.Time_Created = moment(data.Time_Created).format('YYYY-MM-DD HH:mm:ss+00:00')
            io.emit('create match', data)
            res.send(data)
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
  })

  app.put('/1/mtg-games', function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query('UPDATE mtg_games SET Game_On = ?, Opponents = ? WHERE Id = ?', [req.body.Game_On, req.body.Opponents, req.body.Id], function(err, rows, fields) {
      connection.release()
      if(!err) {
        io.emit('join match', req.body)
        res.send(req.body)
      } else {
        console.log(err)
        res.sendStatus(500)
      }
      })
    })
  })

}
