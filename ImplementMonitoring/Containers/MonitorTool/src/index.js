const express = require('express')
const app = express()
const PORT = 3000
const mongoose = require('mongoose')
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'cloneDetector'

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

app.get('/', (req, res) => {
  let output = '<h1>All-at-Once Statistics</h1>'
  output += `<p>Current stage: ${currentStage}</p>`
  output += `<p>
		Files: ${counts.files}, ` +
		`Chunks: ${counts.chunks}, ` +
    `Candidates: ${counts.candidates}, ` +
		`Clones: ${counts.clones}</p>`

  for (const stage of stages) {
    output += `<h2>${stage.name}</h2><ul>`
    for (const item of stageCounts[stage.key]) {
      output += `<li>
					${((item.time - item.startedAt) / 1000).toFixed(1)} seconds:
					${item.counts[stage.key]} ${stage.key}
				</li>`
    }
    output += '</ul>'
  }

  res.send(output)
})

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
    Array.isArray(update.message) && String(update.message[0] || '').includes('Reading')
  )
  if (lastRead && Date.now() - new Date(lastRead.timestamp).getTime() > 10000) {
    for (const stage of stages)
			stageCounts[stage.key] = []
    return
  }

  let activeStage
  let lastUpdateTimestamp

  for (let index = updates.length - 1; index >= 0; index--) {
    const text = Array.isArray(updates[index].message) ? String(updates[index].message[0] || '') : ''
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

