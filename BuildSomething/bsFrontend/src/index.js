const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const mongoose = require('mongoose')
const Objects = require('./model')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
mongoose.connect(MONGO_URL).then(
  console.log('Connected to MongoDB')
)

// Set up express -------------------------------------------
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes --------------------------------------------
const startPage = (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html'))

const listObjects = async (req, res) => {
  const bsObjects = await Objects.find()
  res.json(bsObjects)
}

const createObject = async (req, res) => {
  console.log(req)
  const bsObject = await Objects.create({ name: req.body.name, numbers: req.body.numbers })
  res.status(201).json(bsObject)
}

var router = express.Router()
router.get('/', startPage)
router.get('/api/objects', listObjects)
router.post('/api/objects', createObject)
app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
