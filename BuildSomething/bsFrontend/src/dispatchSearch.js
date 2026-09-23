const fetch = require('node-fetch')
const Objects = require('./model')

const SEARCH_API_URL = 'http://bs-search:3000/api/search'

const searchForNumber = async (number) => {
    const ids = (await Objects.distinct('_id')).map(id => id.toString())

    const requests = ids.map(id =>
        fetch(`${SEARCH_API_URL}/number/${id}/${number}`)
        .then(res => res.json())
    )

    const results = await Promise.all(requests)
    return results
}

const searchInRange = async (low, high) => {
    const ids = (await Objects.distinct('_id')).map(id => id.toString())

    const requests = ids.map(id =>
        fetch(`${SEARCH_API_URL}/range/${id}/${low}/${high}`)
        .then(res => res.json())
    )

    const results = await Promise.all(requests)
    return results
}

module.exports = {searchForNumber, searchInRange}
