const form = document.getElementById('note-form')
const input = document.getElementById('note-text')
const list = document.getElementById('note-list')

const render = notes => {
  list.innerHTML = ''
  notes.forEach(note => {
    const li = document.createElement('li')
    li.textContent = `${note.text} (${new Date(note.createdAt).toLocaleString()})`
    list.appendChild(li)
  })
}

const loadNotes = async () => {
  const res = await fetch('/api/notes')
  render(await res.json())
}

form.addEventListener('submit', async e => {
  e.preventDefault()
  await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: input.value })
  })
  input.value = ''
  loadNotes()
})

loadNotes()
