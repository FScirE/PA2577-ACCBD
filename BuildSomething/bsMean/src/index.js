const express = require('express')
const mongoose = require('mongoose')
const Objects = require('./model')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
let connected = false
while (!connected) {
  try {
    mongoose.connect(MONGO_URL).then(
      console.log('Connected to MongoDB')
    )
    connected = true
  }
  catch {
    console.warn('MongoDB connection failed, retrying')
    // retry after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

// Mean calculation -----------------------------------------
const calculateMean = async (req, res) => {
  const entry = await Objects.findById(req.params.id)

  if (!entry) {
    return res.status(404).json({ error: 'entry not found' })
  }
  if (entry.numbers.length === 0) {
    return res.status(404).json({ error: 'array is empty' })
  }

  const sum = entry.numbers.reduce((total, value) => total + value, 0)
  const mean = sum / entry.numbers.length

  res.json({ id: req.params.id, count: entry.numbers.length, mean: mean })
}

// Routes ---------------------------------------------------
var router = express.Router()
router.get('/api/mean/:id', calculateMean)
app.use('/', router)

// Start service --------------------------------------------
app.listen(PORT, () => {
  console.log(`bsMean running on port ${PORT}`)
})
