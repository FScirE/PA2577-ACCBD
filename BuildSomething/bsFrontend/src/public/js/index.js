const form = document.getElementById('data-form')
const fillButton = document.getElementById('fill-button')
const clearButton = document.getElementById('clear-button')
const nameInput = document.getElementById('name-input')
const numberInput = document.getElementById('number-input')
const numberList = document.getElementById('number-list')
const addButton = document.getElementById('add-button')
const meanButton = document.getElementById('mean-button')
const objectList = document.getElementById('object-list')
const searchNumberInput = document.getElementById('search-number-input')
const searchRangeLow = document.getElementById('search-range-low')
const searchRangeHigh = document.getElementById('search-range-high')
const searchNumberButton = document.getElementById('search-number-button')
const searchRangeButton = document.getElementById('search-range-button')

var numbers = []
var objects = []

const MAX_VALUE = 10000
const MIN_VALUE = -10000

const renderObjects = () => {
  objectList.innerHTML = ''
  objects.forEach(object => {
    const li = document.createElement('li')
    const count = object.numberCount ?? 0
    li.textContent = `${object.name} (${count} numbers)`
    objectList.appendChild(li)
  })
}
const renderNumbers = () => {
  numberList.innerHTML = "<h4>Numbers to add:</h4>" + (numbers.length > 0 ? numbers.join(', ') : '-')
}

const loadObjects = async () => {
  const res = await fetch(
    '/api/objects',
    { cache: 'no-cache' }
  )
  objects = await res.json()
  renderObjects()
}

const addNumber = () => {
  if (!numberInput.value)
    return false

  const value = numberInput.value
  numbers.push(Math.min(MAX_VALUE, Math.max(value, MIN_VALUE)))
  numberInput.value = ""
  renderNumbers()
  return true
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  // enter should add number, and if no number it should send
  if (addNumber())
    return

  // fails if no name or numbers
  if (!nameInput.value || numbers.length === 0) {
    window.alert("Must enter name and some numbers")
    return
  }

  const response = await fetch('/api/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, numbers: numbers })
  })
  if (!response.ok) {
    window.alert('Could not save the object')
    return
  }

  nameInput.value = ''
  numbers = []
  renderNumbers()
  await loadObjects()
})

addButton.addEventListener('click', addNumber)

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

  window.alert(JSON.stringify(result))
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

  window.alert(JSON.stringify(result))
})

fillButton.addEventListener('click', async () => {
  await fetch("/api/fill")
  await loadObjects()
})

clearButton.addEventListener('click', async () => {
  await fetch("/api/clear")
  await loadObjects()
})

loadObjects()
