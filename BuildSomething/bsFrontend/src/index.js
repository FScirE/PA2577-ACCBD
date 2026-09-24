const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const Objects = require('./model')
const calculateMeans = require('./dispatchMean')
const { searchForNumber, searchInRange } = require('./dispatchSearch')

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
  // only send name and length of number array
  const bsObjects = await Objects.aggregate([{
    $project: {
      _id: 0,
      name: 1,
      numberCount: { $size: '$numbers' }
    }
  }])

  res.json(bsObjects)
}

const createObject = async (req, res) => {
  const name = req.body.name
  const numbers = req.body.numbers

  if (!name || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'Name and Numbers is required'})
  }

  const numberArray = numbers.map(Number)

  for (const number of numberArray) {
    if (!Number.isFinite(number)) {
      return res.status(400).json({ error: 'All values must be numbers'})
    }
  }

  const bsObject = await Objects.create({ name: req.body.name, numbers: req.body.numbers })
  res.status(201).json(bsObject)
}

const getMean = async (req, res) => {
  const means = await calculateMeans()
  const validMeans = means.filter(item => item && !item.error)

  const totalSum = validMeans.reduce((sum, item) => sum + item.sum, 0)
  const totalNumbers = validMeans.reduce((count, item) => count + item.count, 0)
  let totalMean = 0

  if (totalNumbers > 0) {
    totalMean = totalSum / totalNumbers
  }

  res.json({ mean: totalMean, entries: validMeans.length, numbers: totalNumbers })
}

const getSearchNumber = async (req, res) => {
  const results = await searchForNumber(req.params.number)
  const validResults = results.filter(item => item && !item.error)

  const allNames = validResults.length > 0
    ? validResults
      .filter(item => item.found)
      .map(item => item.name)
    : []

  res.json({ names: allNames })
}

const getSearchRange = async (req, res) => {
  const results = await searchInRange(req.params.low, req.params.high)
  const validResults = results.filter(item => item && !item.error)

  const allNames = validResults.length > 0
    ? validResults
      .filter(item => item.found)
      .map(item => item.name)
    : []

  res.json({ names: allNames })
}

const fillDB = async (req, res) => {
  // fills 100 entries with 100-1000 random numbers from -10000 to 10000 inclusive
  for (let i = 0; i < 100; i++) {
    await Objects.create({ name: 'testObject' + i.toString(), numbers: Array.from(
      { length: Math.floor(Math.random() * 901) + 100 },
      () => Math.floor(Math.random() * 20001) - 10000
    )})
  }
  res.status(200).json({ success: true })
}

const clearDB = async (req, res) => {
  await Objects.deleteMany({})
  res.status(200).json({ success: true })
}

var router = express.Router()
router.get('/', startPage)
router.get('/api/fill', fillDB)
router.get('/api/clear', clearDB)
router.get('/api/objects', listObjects)
router.post('/api/objects', createObject)
router.get('/api/mean', getMean)
router.get('/api/search/number/:number', getSearchNumber)
router.get('/api/search/range/:low/:high', getSearchRange)
app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
