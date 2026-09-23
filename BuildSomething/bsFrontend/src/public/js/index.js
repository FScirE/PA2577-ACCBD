const form = document.getElementById('data-form')
const nameInput = document.getElementById('name-input')
const numberInput = document.getElementById('number-input')
const numberList = document.getElementById('number-list')
const addButton = document.getElementById('add-button')
const meanButton = document.getElementById('mean-button')
const objectList = document.getElementById('object-list')

var numbers = []
var objects = []

const MAX_VALUE = 10000
const MIN_VALUE = -10000

const renderObjects = () => {
  objectList.innerHTML = ''
  objects.forEach(object => {
    const li = document.createElement('li')
    li.textContent = `${object.name} : ${object.numbers.join(', ')}`
    objectList.appendChild(li)
  })
}
const renderNumbers = () => {
  numberList.innerHTML = "<h4>Numbers to add:</h4>" + numbers.join(', ')
}

const loadObjects = async () => {
  const res = await fetch('/api/objects')
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

  await fetch('/api/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, numbers: numbers })
  })
  nameInput.value = ''
  numbers = []
  renderNumbers()
  loadObjects()
})

addButton.addEventListener('click', addNumber)

meanButton.addEventListener('click', async (e) => {
  const response = await fetch('/api/mean')
  const result = await response.json()
  window.alert(`Mean: ${result.mean} (from ${result.amt} valid entries)`)
})

loadObjects()
