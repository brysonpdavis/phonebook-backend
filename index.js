const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')


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

app.use(morgan(
    (tokens, req, res) => {
        return req.method === 'POST' ? JSON.stringify(req.body) : null
    }
))

app.use(cors())

app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons =>
        response.json(persons)
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findById(id).then( person =>{
        response.json(person)
    })
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people
        <br />
        <br />
        ${new Date()}`
    )
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    // console.log(body)

    if (!body.name || !body.number) {
        return response.status(400).json({error: 'content missing'})
    }

    if (persons.reduce((prev, person) => prev || person.name === body.name, false )){
        return response.status(400).json({error: 'name must be unique'})
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    console.log('deleted id', id)
    
    Person.findByIdAndRemove(id)
    .then( err => {
        if (err) {
            console.log(err)
        }
        console.log('successful deletion')
        response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})