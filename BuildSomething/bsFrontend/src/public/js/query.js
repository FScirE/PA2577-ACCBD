const objectList = document.getElementById('object-list')
const meanButton = document.getElementById('mean-button')
const searchNumberInput = document.getElementById('search-number-input')
const searchRangeLow = document.getElementById('search-range-low')
const searchRangeHigh = document.getElementById('search-range-high')
const searchNumberButton = document.getElementById('search-number-button')
const searchRangeButton = document.getElementById('search-range-button')

var names = []

const renderNames = () => {
  objectList.innerHTML = ''

  if (names.length === 0) {
    objectList.innerHTML = 'No matches'
    return
  }

  names.forEach(name => {
    const li = document.createElement('li')
    li.textContent = `${name}`
    objectList.appendChild(li)
  })
}

meanButton.addEventListener('click', async () => {
  const response = await fetch('/api/mean')
  const result = await response.json()
  window.alert(`Mean: ${result.mean} (from ${result.numbers} numbers in ${result.entries} entries)`)
})

searchNumberButton.addEventListener("click" , async () => {
  const number = searchNumberInput.value

  if (!number) {
    window.alert("Enter a valid number")
    return
  }

  const response = await fetch('/api/search/number/' + number)
  const result = await response.json()

  console.log(result.names)
  names = result.names
  renderNames()
})

searchRangeButton.addEventListener("click" , async () => {
  const low = searchRangeLow.value
  const high = searchRangeHigh.value

  if (!low || !high) {
    window.alert("Enter valid bounds")
    return
  }

  const response = await fetch(`/api/search/range/${low}/${high}`)
  const result = await response.json()

  names = result.names
  renderNames()
})
