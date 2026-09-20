const express = require('express')
const path = require('path')
const fetch = require('node-fetch')

const PORT = 3000
const app = express()

app.use(express.static(path.join(__dirname, 'public')));

// Set up routes --------------------------------------------
const startPage = (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html'))

var router = express.Router()
router.get('/', startPage)
app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
