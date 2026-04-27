import {Navigate, Outlet} from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({redirectTo = '/login'}) => {
    const {isAuthenticated, loading} = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', height: '100vh'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    return isAuthenticated ? <Outlet/> : <Navigate to={redirectTo} replace/>;
};

export default ProtectedRoute;
