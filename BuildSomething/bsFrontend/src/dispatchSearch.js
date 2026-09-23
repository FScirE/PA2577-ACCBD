const fetch = require('node-fetch')

const SEARCH_API_URL = 'http://bs-search:3000'

const searchNumber = async (number) => {
    const result = await fetch(`${SEARCH_API_URL}/number/${number}`)

    return result.json()
}

const searchName = async (name) => {
    const result = await fetch(`${SEARCH_API_URL}/name/${name}`)

    return result.json()
}

module.exports = {searchNumber, searchName}
