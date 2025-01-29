const { Link, NavLink } = ReactRouterDOM
const { useNavigate } = ReactRouter

import { authService } from '../services/auth.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader({ loggedinUser, setLoggedinUser }) {

    function onLogout() {
        authService.logout()
            .then(() => {
                setLoggedinUser(null)
                navigate('/auth')
            })
            .catch(err => {
                console.log(err)
                showErrorMsg(`Couldn't logout`)
            })
    }

    return <header className="app-header main-content single-row">
        <h1>Miss Bug</h1>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/bug">Bugs</NavLink>
            <NavLink to="/about">About</NavLink>
            {
                !loggedinUser ?
                    <NavLink to="/auth" >Login</NavLink> :
                    <div className="user">
                        <Link to={`/user/${loggedinUser._id}`}>{loggedinUser.fullname}</Link>
                        <button onClick={onLogout}>logout</button>
                    </div>

            }

        </nav>
    </header>
}