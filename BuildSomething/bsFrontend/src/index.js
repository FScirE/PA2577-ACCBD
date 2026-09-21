const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const mongoose = require('mongoose')

const PORT = 3000
const MONGO_URL = 'mongodb://bs-database:27017/bsdb'
const app = express()

// Connect to database --------------------------------------
mongoose.connect(MONGO_URL).then(
  console.log('Connected to MongoDB')
)

const Note = mongoose.model('Note', new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}))

// Set up express -------------------------------------------
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes --------------------------------------------
const startPage = (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html'))

const listNotes = async (req, res) => {
  const notes = await Note.find()
  res.json(notes)
}

const createNote = async (req, res) => {
  const note = await Note.create({ text: req.body.text })
  res.status(201).json(note)
}

var router = express.Router()
router.get('/', startPage)
router.get('/api/notes', listNotes)
router.post('/api/notes', createNote)
app.use('/', router)

// Start app ------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
