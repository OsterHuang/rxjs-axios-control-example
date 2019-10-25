const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8081

app.use(bodyParser.json())
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', '*')
  next()
})

app.get('/', delayResponse, (req, res) => res.send('Hello World!'))

app.get('/api/getToken', delayResponse, (req, res) => { res.json({ token: 'oster-token' }) })
app.post('/api/verifyToken', delayResponse, verifyToken, (req, res) => {
  /*
  * 重要: 由參數來決定是否要過期 比較好模擬各種狀況
  */
  if (req.body.pass) {
    res.json({ sucess: true })
  } else {
    res.status(401).json({ code: 'expired', message: 'Token expired 過期嘍' })
  }
})
app.post('/api/refreshToken', delayResponse, (req, res) => {
  if (req.body.refreshPass) {
    res.json({ sucess: true, newToken: 'oster-new-token' })
  } else {
    res.sendStatus(403)
  }
})

function delayResponse(req, res, next) {
  setTimeout(next, 1000)
}

function verifyToken(req, res, next) {
  if (!req.headers['x-auth']) {
    res.status(401).json({ code: 'invalid', message: 'Token 驗證失敗，還沒過期' })
    return
  }

  next()
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
