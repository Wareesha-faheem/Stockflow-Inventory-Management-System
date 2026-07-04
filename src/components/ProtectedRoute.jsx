import { useContext } from "react";
import LoginContext from "../contexts/LoginContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
    const { isloggedin, role } = useContext(LoginContext)

    if (!isloggedin) {
        return <Navigate to="/login" />
    }

    // optional: restrict a route to specific roles (e.g. Users page)
    if (roles && !roles.includes(role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute
