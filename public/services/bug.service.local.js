import { utilService } from './util.service.js'


const BASE_URL = '/api/bug/'
// _createBugs()

export const bugService = {
    query,
    get,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = getDefaultFilter()) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            console.log('err:', err)
        })
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug).then(res => res.data).catch(err => { console.log('err:', err) })
    } else {
        // bug.owner = authService.getLoggedinUser()
        return axios.post(BASE_URL, bug).then(res => res.data).catch(err => { console.log('err:', err) })
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, sortBy: 'title' }
}

// function _createBugs() {
//     let bugs = utilService.loadFromStorage(BASE_URL)
//     if (bugs && bugs.length > 0) return

//     bugs = [
//         {
//             title: "Infinite Loop Detected",
//             severity: 4,
//             _id: "1NF1N1T3"
//         },
//         {
//             title: "Keyboard Not Found",
//             severity: 3,
//             _id: "K3YB0RD"
//         },
//         {
//             title: "404 Coffee Not Found",
//             severity: 2,
//             _id: "C0FF33"
//         },
//         {
//             title: "Unexpected Response",
//             severity: 1,
//             _id: "G0053"
//         }
//     ]
//     utilService.saveToStorage(BASE_URL, bugs)
// }


// function _saveBugsToFile() {
//     return new Promise((resolve, reject) => {
//         const data = JSON.stringify(bugs, null, 4)
//         fs.writeFile('data/bug.json', data, (err) => {
//             if (err) {
//                 console.log(err)
//                 return reject(err)
//             }
//             resolve()
//         })
//     })
// }