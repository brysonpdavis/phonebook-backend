const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

let persons = [
    {
        id: 1,
        name: "Arto Helas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.use(express.json())

app.use(morgan('tiny'))

app.use(cors())

app.use(express.static('build'))

app.use(morgan(
    (tokens, req, res) => {
        return req.method === 'POST' ? JSON.stringify(req.body) : null
    }
))

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people
        <br />
        <br />
        ${new Date()}`
    )
})

const generateId = () => {
    return Math.floor(Math.random() * 999999)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    // console.log(body)

    if (!body.name || !body.number) {
        return response.status(400).json({error: 'content missing'})
    }

    if (persons.reduce((prev, person) => prev || person.name === body.name, false )){
        return response.status(400).json({error: 'name must be unique'})
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})