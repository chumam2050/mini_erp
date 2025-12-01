import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [healthStatus, setHealthStatus] = useState(null)

    useEffect(() => {
        // Check backend health
        const checkHealth = async () => {
            try {
                const response = await axios.get('/api/health')
                setHealthStatus(response.data)
            } catch (err) {
                console.error('Health check failed:', err)
            }
        }

        // Fetch users
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const response = await axios.get('/api/users')
                setUsers(response.data)
                setError(null)
            } catch (err) {
                setError('Gagal mengambil data dari backend. Pastikan server backend berjalan.')
                console.error('Error fetching users:', err)
            } finally {
                setLoading(false)
            }
        }

        checkHealth()
        fetchUsers()
    }, [])

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }} className="fade-in">
                <h1 style={{
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    MiniERP System
                </h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
                    Enterprise Resource Planning dengan React + Vite & Express
                </p>

                {healthStatus && (
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        background: 'var(--success)',
                        color: 'white',
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }}></span>
                        Backend Connected: {healthStatus.message}
                    </div>
                )}
            </header>

            <main>
                <div className="card fade-in" style={{ animationDelay: '100ms' }}>
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                        👥 Daftar Pengguna
                    </h2>

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div className="spinner"></div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'var(--error)',
                            color: 'white',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {!loading && !error && users.length > 0 && (
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            {users.map((user, index) => (
                                <div
                                    key={user.id}
                                    className="fade-in"
                                    style={{
                                        padding: 'var(--spacing-lg)',
                                        background: 'var(--gray-50)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--gray-200)',
                                        transition: 'all var(--transition-base)',
                                        animationDelay: `${(index + 2) * 50}ms`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--primary-50)'
                                        e.currentTarget.style.borderColor = 'var(--primary-200)'
                                        e.currentTarget.style.transform = 'translateX(4px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-50)'
                                        e.currentTarget.style.borderColor = 'var(--gray-200)'
                                        e.currentTarget.style.transform = 'translateX(0)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-xs)' }}>
                                                {user.name}
                                            </h3>
                                            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <div style={{
                                            background: 'var(--primary-100)',
                                            color: 'var(--primary-700)',
                                            padding: 'var(--spacing-xs) var(--spacing-md)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {user.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card fade-in" style={{ marginTop: 'var(--spacing-xl)', animationDelay: '200ms' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
                        🚀 Fitur MiniERP
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary-600)' }}>
                                ⚡ Vite + React
                            </h4>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                Frontend modern dengan hot module replacement untuk development yang cepat
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary-600)' }}>
                                🔧 Express Backend
                            </h4>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                RESTful API dengan Node.js dan Express untuk backend yang scalable
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary-600)' }}>
                                📦 Lerna Monorepo
                            </h4>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                Manajemen multi-package yang efisien dengan Lerna
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-2xl)',
                padding: 'var(--spacing-xl) 0',
                color: 'var(--gray-500)',
                fontSize: '0.875rem'
            }}>
                <p>MiniERP System - Built with ❤️ using Vite, React, and Express</p>
            </footer>
        </div>
    )
}

export default App
