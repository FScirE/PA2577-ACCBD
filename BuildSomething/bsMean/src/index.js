const express = require('express')
const mongoose = require('mongoose')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
mongoose.connect(MONGO_URL).then(
  console.log('Connected to MongoDB')
)

// Set up express -------------------------------------------
app.use(express.json())

// Mean entry -----------------------------------------------
const Entry = mongoose.model('Entry', new mongoose.Schema({
  entryId: String,
  values: [Number],
  createdAt: {
    type: Date,
    default: Date.now
  }
}))

const listEntries = async (req, res) => {
  const entries = await Entry.find().sort({ createdAt: -1 })
  res.json(entries)
}

const createEntry = async (req, res) => {
  const entryId = req.body.entryId
  const values = req.body.values

  if (!entryId || !Array.isArray(values)) {
    return res.status(400).json({ error: 'entryId or array values required' })
  }

  const entry = await Entry.create({ entryId, values })
  res.status(201).json(entry)
}

const calculateMean = async (req, res) => {
  const entry = await Entry.findOne({ entryId: req.params.entryId })

  if (!entry) {
    return res.status(404).json({ error: 'entry not found' })
  }

  if (entry.values.length === 0) {
    return res.status(404).json({ error: 'array is empty' })
  }

  const sum = entry.values.reduce((total, value) => total + value, 0)
  const mean = sum / entry.values.length

  res.json({ entryId: entry.entryId, values: entry.values, mean })
}

// Routes ---------------------------------------------------
var router = express.Router()
router.get('/api/entries', listEntries)
router.post('/api/entries', createEntry)
router.get('/api/mean/:entryId', calculateMean)
app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`bsMean running on port ${PORT}`)
})
