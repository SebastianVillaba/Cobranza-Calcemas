import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIdUsuario } from '../features/user/userSlice';

const ProtectedRoute = ({ children }) => {
    const idUsuario = useSelector(selectIdUsuario);

    // Verificar si hay usuario logueado (o token)
    if (!idUsuario) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
