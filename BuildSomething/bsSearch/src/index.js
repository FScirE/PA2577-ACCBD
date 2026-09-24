const express = require('express')
const mongoose = require('mongoose')
const Objects = require('./model')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
const connectToDatabase = async () => {
  while (true) {
    try {
      await mongoose.connect(MONGO_URL)
      console.log('Connected to MongoDB')
      return
    }
    catch (error) {
      console.warn('MongoDB connection failed, retrying')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

// Search ---------------------------------------------------
const searchNumber = async (req, res) => {
  const entry = await Objects.findById(req.params.id)

  if (!entry) {
    return res.status(404).json({ error: 'entry not found' })
  }
  if (entry.numbers.length === 0) {
    return res.status(404).json({ error: 'array is empty' })
  }

  const number = Number(req.params.number)
  const found = entry.numbers.includes(number)

  res.json({ id: req.params.id, name: entry.name, found: found })
}

const searchRange = async (req, res) => {
  const entry = await Objects.findById(req.params.id)

  if (!entry) {
    return res.status(404).json({ error: 'entry not found' })
  }
  if (entry.numbers.length === 0) {
    return res.status(404).json({ error: 'array is empty' })
  }

  const low = Number(req.params.low)
  const high = Number(req.params.high)
  // look for lower and upper both inclusive
  const found = entry.numbers.filter(n => n < low || n > high).length === 0

  res.json({ id: req.params.id, name: entry.name, found: found })
}

// Routes ---------------------------------------------------
var router = express.Router()
router.get('/api/search/number/:id/:number', searchNumber)
router.get('/api/search/range/:id/:low/:high', searchRange)

const startServer = async () => {
  await connectToDatabase()

  app.use('/', router)

  // Start service --------------------------------------------
  app.listen(PORT, () => {
    console.log(`bsSearch running on port ${PORT}`)
  })
}

startServer()
