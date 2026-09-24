const form = document.getElementById('data-form')
const fillButton = document.getElementById('fill-button')
const clearButton = document.getElementById('clear-button')
const nameInput = document.getElementById('name-input')
const numberInput = document.getElementById('number-input')
const numberList = document.getElementById('number-list')
const addButton = document.getElementById('add-button')
const objectList = document.getElementById('object-list')

var numbers = []
var objects = []

const MAX_VALUE = 10000
const MIN_VALUE = -10000

const renderObjects = () => {
  objectList.innerHTML = ''

  if (objects.length === 0) {
    objectList.innerHTML = 'No entries'
    return
  }

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

fillButton.addEventListener('click', async () => {
  await fetch("/api/fill")
  await loadObjects()
})

clearButton.addEventListener('click', async () => {
  await fetch("/api/clear")
  await loadObjects()
})

loadObjects()
