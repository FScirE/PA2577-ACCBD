const express = require('express')
const app = express()
const PORT = 3000
const mongoose = require('mongoose')
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'cloneDetector'
const getGraph = require('./graph')

const POLLING_DELAY = 1000

const connectToDatabase = async () => {
  while (true) {
    try {
      await mongoose.connect(MONGO_URL, { dbName: DB_NAME })
      return
    } catch (error) {
      console.warn('MongoDB connection failed, retrying:', error.message)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}

const stages = [
  { key: 'files', name: 'Storing files', identifier: 'Storing files' },
  { key: 'chunks', name: 'Storing chunks', identifier: 'Storing chunks' },
  { key: 'candidates', name: 'Identifying candidates', identifier: 'Identifying Clone Candidates' },
  { key: 'clones', name: 'Expanding candidates', identifier: 'Expanding Candidates' }
]
const counts = { files: 0, chunks: 0, candidates: 0, clones: 0 }
const stageCounts = { files: [], chunks: [], candidates: [], clones: [] }
let currentStage = 'Waiting'
let lastRunTimeStamp = null

app.get('/', (req, res) => {
  let output = '<h1>All-at-Once Statistics</h1><p><a href="/graph">View graphs</a></p>'
  output += `<p>Current stage: ${currentStage}</p>`
  output += `<p>
		Files: ${counts.files}, ` +
		`Chunks: ${counts.chunks}, ` +
    `Candidates: ${counts.candidates}, ` +
		`Clones: ${counts.clones}</p>`

  for (const stage of stages) {
    const timingHistory = stageCounts[stage.key]

    output += `<h2>${stage.name}</h2>`

    if (timingHistory.length >= 2) {
      const first = timingHistory[0]
      const last = timingHistory[timingHistory.length - 1]

      const time = (last.time - first.time) / 1000
      const units = last.counts[stage.key] - first.counts[stage.key]

      if (time > 0) {
        output += `<p>Average: ${(units / time)}
          ${stage.key}/second</p>`
      }

      if (units > 0) {
        output += `<p>Average time per unit:
        ${(time / units)} seconds</p>`
      }
    }
  }

  res.send(output)
})


app.get('/graph', (req, res) => {
  let output = '<h1>Processing graphs</h1><p><a href="/">Back to statistics</a></p>'

  for (const stage of stages) {
    output += `<h2>${stage.name}</h2>`
    output += getGraph(stageCounts[stage.key], stage.key)
  }

  res.send(output)
})

function getMessage(update) {
  return Array.isArray(update.message)
  ? update.message.join(' ')
  : String(update.message || '')
}

const refreshStats = async () => {
  const database = mongoose.connection.db
  if (!database)
		return

  const [files, chunks, candidates, clones, updates] = await Promise.all([
    database.collection('files').countDocuments(),
    database.collection('chunks').countDocuments(),
    database.collection('candidates').countDocuments(),
    database.collection('clones').countDocuments(),
    database.collection('statusUpdates').find({}).sort({ timestamp: 1 }).toArray()
  ])

  counts.files = files
  counts.chunks = chunks
  counts.candidates = candidates
  counts.clones = clones
  currentStage = 'Waiting'

	// check if old data still exists and clear if that is the case
  const lastRead = updates.findLast(update =>
    getMessage(update).includes('Reading')
  )

  if (lastRead && lastRead.timestamp !== lastRunTimeStamp) {
    for (const stage of stages)
			stageCounts[stage.key] = []
    
    lastRunTimeStamp = lastRead.timestamp
  }

  let activeStage
  let lastUpdateTimestamp

  for (let index = updates.length - 1; index >= 0; index--) {
    const text = getMessage(updates[index])
    if (text.includes('Summary')) {
      currentStage = 'Complete'
      break
    }
		if (text.includes('Consolidating')) {
			currentStage = 'Consolidating clones'
			break
		}

    activeStage = stages.find(stage => text.includes(stage.identifier))
    if (activeStage) {
      lastUpdateTimestamp = updates[index].timestamp
      currentStage = activeStage.name
      break
    }

    if (text.includes('Reading')) {
      currentStage = 'Reading files'
      break
    }
  }

  if (activeStage) {
    stageCounts[activeStage.key].push({
      time: Date.now(),
      startedAt: new Date(lastUpdateTimestamp).getTime(),
      counts: { ...counts }
    })
  }
}

app.listen(PORT, () => console.log('Listening for monitoring stats on port', PORT))

connectToDatabase().then(async () => {
  await refreshStats()
  setInterval(refreshStats, POLLING_DELAY)
})

