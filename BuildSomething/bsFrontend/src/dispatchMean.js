const fetch = require('node-fetch')
const Objects = require('./model')

const MEAN_API_URL = 'http://bs-mean/api/mean:3000'

const calculateMeans = async () => {
  const ids = (await Objects.distinct('_id')).map(id => id.toString())

  const requests = ids.map(id =>
    fetch(`${MEAN_API_URL}/${id}`)
      .then(res => res.json())
  )

  const results = await Promise.all(requests)
  return results
}

module.exports = calculateMeans
