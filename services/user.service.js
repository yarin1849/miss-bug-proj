import fs from 'fs'
import { utilService } from './util.service.js'

const users = utilService.readJsonFile('data/user.json')

export const userService = {
	query,
	getById,
	getByUsername,
	remove,
	add,
}

function query() {
	const usersToReturn = users.map(user => ({ _id: user._id, fullname: user.fullname }))
	return Promise.resolve(usersToReturn)
}

function getById(userId) {
	var user = users.find(user => user._id === userId)
	if (!user) return Promise.reject('User not found!')

	user = { ...user }
	delete user.password

	return Promise.resolve(user)
}

function getByUsername(username) {
	// You might want to remove the password validation for dev
	var user = users.find(user => user.username === username)
	if (!user) return Promise.reject('User not found!')
	return Promise.resolve(user)
}

function remove(userId) {
	users = users.filter(user => user._id !== userId)
	return _saveUsersToFile()
}

function add(user) {
	console.log('user.username', user.username)
	return getByUsername(user.username)
		.catch(err => {
			if (err === 'User not found!') {
				return null
			}
			return Promise.reject(err)
		}) // Check if username exists...
		.then(existingUser => {
			console.log('existingUser', existingUser)
			if (existingUser) return Promise.reject('Username taken')

			user._id = utilService.makeId()
			console.log('user._id', user._id)
			// Later, we will call the authService here to encrypt the password
			users.push(user)
			return _saveUsersToFile()
				.then(() => {
					user = { ...user }
					delete user.password
					return user
				})
		})
}


function _saveUsersToFile() {
	return new Promise((resolve, reject) => {
		const usersStr = JSON.stringify(users, null, 2)
		fs.writeFile('data/user.json', usersStr, err => {
			if (err) {
				return console.log(err)
			}
			resolve()
		})
	})
}