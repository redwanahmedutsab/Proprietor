import {useState, useEffect, useCallback} from 'react';
import {getProperties} from '../api/propertyAPI';

const useProperties = (initialFilters = {}) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [count, setCount] = useState(0);

    const fetchProperties = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const {data} = await getProperties(params);
            if (data.results) {
                setProperties(data.results);
                setCount(data.count);
            } else {
                setProperties(data);
                setCount(data.length);
            }
        } catch (err) {
            setError('Failed to load properties.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties(filters);
    }, [filters, fetchProperties]);

    const applyFilters = (newFilters) => {
        setFilters((prev) => ({...prev, ...newFilters}));
    };

    const resetFilters = () => {
        setFilters({});
    };

    return {properties, loading, error, count, filters, applyFilters, resetFilters};
};

export default useProperties;
