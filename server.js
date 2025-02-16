import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.service.js'
import { userService } from './services/user.service.js'

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

//LIST
app.get('/api/bug', (req, res) => {

    console.log('req.query', req.query)
    const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSeverity,
        labels: req.query.labels,
        pageIdx: req.query.pageIdx
    }

    const sortBy = req.query.sortBy || 'title'
    console.log('sortBy', sortBy)

    bugService.query(filterBy, sortBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//CREATE
app.post('/api/bug', (req, res) => {
    console.log('req.body:', req.body)

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('You need to loged in')

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity || 3,
        createdAt: req.body.createdAt || Date.now(),
        labels: req.body.labels,
    }

    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug:', err)
            res.status(500).send('Cannot save bug')
        })
})

//UPDATE
app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't update car`)

    console.log('req.body:', req.body)
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: req.body.createdAt,
        labels: req.body.labels,
        owner: req.body.owner,
    }
    console.log('bugToSave', bugToSave)
    bugService.save(bugToSave, loggedinUser)
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
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't remove car`)

    const { bugId } = req.params
    console.log('bugId', bugId)
    bugService.remove(bugId)
        .then(() => res.send(bugId + ' Removed Successfully!'))
        .catch(err => {
            loggerService.error('Cannot remove bug:', err)
            res.status(500).send('Cannot remove bug')
        })
})

// Authentication API Routes

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {

                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    console.log('credentials', credentials)

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// User API
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)