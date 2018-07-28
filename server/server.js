const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose.js')
const { Todo } = require('./models/todo.js')
const { User } = require('./models/user.js')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    })
    todo.save()
        .then(doc => { res.status(200).send(doc) })
        .catch(err => { res.status(400).send(err) })
})

app.get('/todos', (req, res) => {
    Todo.find()
        .then(
            todos => { res.send({ todos }) },
            err => { res.status(400).send(err) })
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    Todo.findById(id)
        .then(todo => {
            if (!todo)
                return res.status(404).send('ID not found')
            console.log('Todo by ID', todo)
            res.status(200).send({ todo })
        })
        .catch(err => {
            console.log('Error', err)
            res.status(400).send(`Error ${err}`)
        })

})

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    Todo.findByIdAndRemove(id)
        .then(todo => {
            if (!todo)
                return res.status(404).send('ID not found')
            console.log('Removed Todo by ID', todo)
            res.status(200).send({ todo })
        })
        .catch(err => {
            console.log('Error', err)
            res.status(400).send(`Error ${err}`)
        })
})

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])

    if (!ObjectID.isValid(id))
        return res.status(404).send(`Invalid ID ${id}`)

    if (_.isBoolean(body.completed) && body.completed)
        body.completedAt = new Date().getTime()
    else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then(todo => {
            if (!todo)
                return res.status(404).send()
            res.send({ todo })
        })
        .catch(err => {
            res.status(400).send()
        })
})

app.listen(port, () => {
    console.log(`Started on port ${port}`)
})

module.exports = { app }