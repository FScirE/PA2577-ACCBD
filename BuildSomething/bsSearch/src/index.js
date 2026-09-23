const express = require('express')
const mongoose = require('mongoose')
const Objects = require('./model')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
mongoose.connect(MONGO_URL).then(
  console.log('Connected to MongoDB')
)

// Search ---------------------------------------------------
const searchNumber = async (req, res) => {
  const number = Number(req.params.number)
  const result = await Objects.find({ numbers: number })

  res.json(result)
}

const searchName = async (req, res) => {
  const result = await Objects.find({ name: req.params.name })
  res.json(result)
}

// Routes ---------------------------------------------------
var router = express.Router()
router.get('/api/search/number/:number', searchNumber)
router.get('/api/search/name/:name', searchName)
app.use('/', router)

// Start service --------------------------------------------
app.listen(PORT, () => {
  console.log(`bsSearch running on port ${PORT}`)
})
