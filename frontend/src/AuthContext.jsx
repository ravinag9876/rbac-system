import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    // Whenever the token changes, save it to local storage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // In a production app, we would decode the JWT here to get the user data on refresh.
            // For now, we rely on the login response to set the user state.
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = async (username, password) => {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            setToken(data.token);
            setUser({ username: data.username, role: data.role });
            navigate('/dashboard'); // Redirect to dashboard on success
            return true;
        }
        return false;
    };

    const logout = () => {
        setToken(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};