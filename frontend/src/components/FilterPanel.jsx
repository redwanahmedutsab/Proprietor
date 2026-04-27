const FilterPanel = ({filters, onApply, onReset}) => {
    const handleChange = (e) => {
        const {name, value} = e.target;
        onApply({[name]: value || undefined});
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <span>Filters</span>
                <button onClick={onReset} className="btn-reset">Clear all</button>
            </div>

            <div className="filter-group">
                <label>Listing Type</label>
                <select name="property_type" value={filters.property_type || ''}
                        onChange={handleChange}>
                    <option value="">All</option>
                    <option value="rent">For Rent</option>
                    <option value="buy">For Sale</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Category</label>
                <select name="category" value={filters.category || ''} onChange={handleChange}>
                    <option value="">All</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop / Commercial</option>
                    <option value="land">Land</option>
                </select>
            </div>

            <div className="filter-group">
                <label>City</label>
                <input name="city" placeholder="e.g. Dhaka"
                       value={filters.city || ''} onChange={handleChange}/>
            </div>

            <div className="filter-group">
                <label>Area / Neighbourhood</label>
                <input name="area" placeholder="e.g. Gulshan"
                       value={filters.area || ''} onChange={handleChange}/>
            </div>

            <div className="filter-group">
                <label>Min Price (BDT)</label>
                <input type="number" name="min_price" placeholder="0"
                       value={filters.min_price || ''} onChange={handleChange}/>
            </div>

            <div className="filter-group">
                <label>Max Price (BDT)</label>
                <input type="number" name="max_price" placeholder="Any"
                       value={filters.max_price || ''} onChange={handleChange}/>
            </div>

            <div className="filter-group">
                <label>Bedrooms</label>
                <select name="bedrooms" value={filters.bedrooms || ''} onChange={handleChange}>
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}+</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Sort By</label>
                <select name="ordering" value={filters.ordering || '-created_at'}
                        onChange={handleChange}>
                    <option value="-created_at">Newest First</option>
                    <option value="price">Price: Low → High</option>
                    <option value="-price">Price: High → Low</option>
                    <option value="-views_count">Most Viewed</option>
                </select>
            </div>

        </div>
    );
};

export default FilterPanel;
