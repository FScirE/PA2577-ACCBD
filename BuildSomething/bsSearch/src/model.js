const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: String,
  numbers: [Number]
})
const model = mongoose.model('bsObjects', schema)

module.exports = model
