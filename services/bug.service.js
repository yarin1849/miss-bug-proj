import fs from 'fs'
import { utilService } from "./util.service.js"

export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = utilService.readJsonFile('data/bug.json')
const PAGE_SIZE = 4

function query(filterBy, sortBy) {
    return Promise.resolve(bugs)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }

            if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }

            if (filterBy.pageIdx !== undefined) {
                const startIdx = filterBy.pageIdx * PAGE_SIZE
                bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
            }
            console.log('filterBy.lables', filterBy.lables)
            if (filterBy.lables) {
                bugs = bugs.some(bug => bug.labels.some(filterBy.lables))
            }

            if (sortBy) {
                const [field, direction = 1] = sortBy.split('&sortDir=').map(val => (val === '-1' ? -1 : val))
                bugs = bugs.sort((a, b) => {
                    if (a[field] < b[field]) return -1 * direction
                    if (a[field] > b[field]) return 1 * direction
                    return 0
                })
            }
            return bugs
        })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}


function remove(bugId) {
    console.log('bugId', bugId)
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugs[bugIdx].owner._id !== loggedinUser._id)
        return Promise.reject('Cannot remove User mismatch bug - ' + bugId)
    if (bugIdx < 0) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}


function save(bug, loggedinUser) {

    if (bug._id) {
        // const bugIdx = bugs.findIndex(_bug => _bug._id === bug._id)
        const bugToUpdate = bugs.find(currBug => currBug._id === bug._id)
        // bug = { ...bugs[bugIdx], ...bug }
        // bugs[bugIdx] = bug

        if (bugToUpdate.owner._id !== loggedinUser._id) {
            return Promise.reject('User mismatch bug')
        }

        bugToUpdate.title = bug.title
        bugToUpdate.severity = bug.severity
        bugToUpdate.description = bug.description

    } else {
        bug._id = utilService.makeId()
        bug.description - utilService.makeLorem()
        bug.owner = loggedinUser
        bugs.unshift(bug)
    }

    return _saveBugsToFile().then(() => bug)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}