import { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

export default function Dashboard() {
    const { user, token, logout } = useContext(AuthContext);
    const [systemUsers, setSystemUsers] = useState([]);
    const [accessError, setAccessError] = useState('');

    useEffect(() => {
        // Fetch the protected data using our JWT token
        const fetchUsers = async () => {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSystemUsers(data);
            } else {
                setAccessError('Forbidden: You do not have Admin privileges to view this data.');
            }
        };

        if (token) fetchUsers();
    }, [token]);

    if (!user) return <div style={{ padding: '50px' }}>Loading session...</div>;

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Security Dashboard</h2>
                <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none' }}>
                    Logout
                </button>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
                <p>Logged in as: <strong>{user.username}</strong></p>
                <p>Role Level: <strong style={{ color: user.role === 'Admin' ? 'green' : 'orange' }}>{user.role}</strong></p>
            </div>

            <h3>System Users Database</h3>
            {accessError ? (
                <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' }}>
                    {accessError}
                </div>
            ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>ID</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Username</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Assigned Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {systemUsers.map(u => (
                            <tr key={u.id}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{u.id}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{u.username}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}