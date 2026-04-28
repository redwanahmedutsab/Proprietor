import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import useProperties from '../hooks/useProperties';

const Properties = () => {
    const [searchParams] = useSearchParams();
    const {properties, loading, error, count, filters, applyFilters, resetFilters} =
        useProperties();

    useEffect(() => {
        const params = {};
        for (const [k, v] of searchParams.entries()) params[k] = v;
        if (Object.keys(params).length) applyFilters(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="properties-page">
            <div className="container">

                <div className="page-header">
                    <h1 className="page-title">Properties</h1>
                    <span className="result-count">
            {loading ? '...' : `${count} result${count !== 1 ? 's' : ''}`}
          </span>
                </div>

                <div className="properties-layout">

                    <aside className="filter-sidebar">
                        <FilterPanel
                            filters={filters}
                            onApply={applyFilters}
                            onReset={resetFilters}
                        />
                    </aside>

                    <main className="properties-main">
                        {loading ? (
                            <div className="prop-grid">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"/>)}
                            </div>
                        ) : error ? (
                            <div className="error-msg">{error}</div>
                        ) : properties.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏚</div>
                                <h3>No properties found</h3>
                                <p>Try adjusting your filters or search term.</p>
                                <button className="btn-secondary" onClick={resetFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="prop-grid">
                                {properties.map(p => (
                                    <PropertyCard key={p.id} property={p}/>
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
};

export default Properties;