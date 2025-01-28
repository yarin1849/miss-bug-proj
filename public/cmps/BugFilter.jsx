const { useState, useEffect, useRef } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    // const debounceOnSetFilter = useRef(utilService.debounce(onSetFilter, 1000))


    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, labels } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <label htmlFor="labels">Labels: </label>
                <select value={labels} onChange={handleChange} id="label" name="label">
                    <option value="">Choose a label</option>
                    <option value="critical">critical</option>
                    <option value="need-CR">need-CR</option>
                    <option value="dev-branch">dev-branch</option>
                </select>
            </form>
            <label htmlFor="labels">Sort by: </label>
            <select name="sortBy" value={filterBy.sortBy || 'title'} onChange={handleChange}>
                <option value="title">Title</option>
                <option value="severity&sortDir=-1">Severity</option>
                <option value="createdAt">Created At (Oldest)</option>
                <option value="createdAt&sortDir=-1">Created At (Newest)</option>
            </select>

        </section>
    )
}