const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const Objects = require('./model')
const calculateMeans = require('./dispatchMean')
const {searchNumber , searchName} = require('./dispatchSearch')



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
  const bsObject = await Objects.create({ name: req.body.name, numbers: req.body.numbers })
  res.status(201).json(bsObject)
}

const getMean = async (req, res) => {
  const means = await calculateMeans()
  const validMeans = means.filter(item => item && !item.error)

  const totalMean = validMeans.length > 0
    ? validMeans.reduce((sum, item) => sum + item.mean, 0) / validMeans.length
    : 0

  res.json({ mean: totalMean, amt: validMeans.length })
}

const getSearchNumber = async (req, res) => {
  const result = await searchNumber(req.params.number)

  res.json(result)
}

const getSearchName = async (req, res) => {
  const result = await searchName(req.params.name)

  res.json(result)
}

var router = express.Router()
router.get('/', startPage)
router.get('/api/objects', listObjects)
router.post('/api/objects', createObject)
router.get('/api/mean', getMean)
router.get('/api/search/number/:number', getSearchNumber)
router.get('/api/search/name/:name', getSearchName)

app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
