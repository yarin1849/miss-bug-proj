const { Link } = ReactRouterDOM

import { authService } from '../services/auth.service.js'
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug }) {
    const user = authService.getLoggedinUser()

    function isAllowed(bug) {
        if (!user) return false
        if (user.isAdmin || bug.owner._id === user._id) return true

        return false
    }

    if (!bugs) return <div>Loading...</div>
    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button>
                        <Link to={`/bug/${bug._id}`}>Details</Link>
                    </button>
                    {isAllowed(bug) && <div>
                        <button>
                            <Link to={`/bug/edit/${bug._id}`}>Edit</Link>
                        </button>
                        <button onClick={() => onRemoveBug(bug._id)}>x</button>
                    </div>}
                </section>
            </li>
        ))}
    </ul >
}
