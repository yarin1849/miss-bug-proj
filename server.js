import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

//LIST
app.get('/api/bug', (req, res) => {

    console.log('req.query', req.query)
    const filterBy = {}
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//CREATE
app.post('/api/bug', (req, res) => {
    console.log('req.body:', req.body)
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity || 3,
        createdAt: req.body.createdAt || Date.now(),
        labels: req.body.labels,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug:', err)
            res.status(500).send('Cannot save bug')
        })
})

//UPDATE
app.put('/api/bug/:bugId', (req, res) => {
    console.log('req.body:', req.body)
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity || 3,
        createdAt: req.body.createdAt || Date.now(),
        labels: req.body.labels,
    }
    console.log('bugToSave', bugToSave)
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug:', err)
            res.status(500).send('Cannot save bug')
        })
})

//GET
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params;

    const { visitedBugs = [] } = req.cookies

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
        else visitedBugs.push(bugId)

        res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 70 })
    }

    console.log('User visited the following bugs:', visitedBugs)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug:', err)
            res.status(500).send('Cannot get bug')
        })
})

//REMOVE
app.delete('/api/bug/:bugId', (req, res) => {
    console.log('delete bug...')

    const { bugId } = req.params
    console.log('bugId', bugId)
    bugService.remove(bugId)
        .then(() => res.send(bugId + ' Removed Successfully!'))
        .catch(err => {
            loggerService.error('Cannot remove bug:', err)
            res.status(500).send('Cannot remove bug')
        })
})


const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)